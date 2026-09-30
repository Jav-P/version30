import { join } from 'node:path';
import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileTokenStore, Garmin, GarminClient } from 'garminconnect-js';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class GarminService {
  private garmin: Garmin | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {}

  private async getGarmin(): Promise<Garmin> {
    if (this.garmin) {
      return this.garmin;
    }

    const email = this.configService.get<string>('GARMIN_EMAIL');
    const password = this.configService.get<string>('GARMIN_PASSWORD');
    if (!email || !password) {
      throw new ServiceUnavailableException(
        'Todavía no hay credenciales de Garmin configuradas en el backend.',
      );
    }

    const client = new GarminClient({
      tokenStore: new FileTokenStore(join(process.cwd(), 'packages/backend/.garmin-tokens')),
    });

    const hasTokens = await client.loadTokens();
    if (!hasTokens) {
      const result = await client.login(email, password);
      if (result.state === 'mfa_required') {
        throw new ServiceUnavailableException(
          'Garmin pidió un código de verificación (2FA); no está soportado en modo automático.',
        );
      }
    }

    this.garmin = new Garmin(client);
    return this.garmin;
  }

  private async verifyUser(accessToken: string): Promise<string> {
    const { data, error } = await this.supabaseService.getClient().auth.getUser(accessToken);
    if (error || !data.user) {
      throw new UnauthorizedException('Sesión inválida.');
    }
    return data.user.id;
  }

  async syncDay(accessToken: string, date: string) {
    const userId = await this.verifyUser(accessToken);
    const garmin = await this.getGarmin();

    const [summary, stress, sleep] = await Promise.all([
      garmin.getUserSummary(date).catch(() => null) as Promise<any>,
      garmin.getStressData(date).catch(() => null) as Promise<any>,
      garmin.getSleepData(date).catch(() => null) as Promise<any>,
    ]);

    const sleepDto = sleep?.dailySleepDTO;

    const row = {
      user_id: userId,
      date,
      steps: summary?.totalSteps ?? null,
      calories: summary?.totalKilocalories ?? null,
      active_minutes:
        (summary?.moderateIntensityMinutes ?? 0) + (summary?.vigorousIntensityMinutes ?? 0),
      heart_rate_resting: summary?.restingHeartRate ?? null,
      stress_avg: stress?.avgStressLevel ?? null,
      stress_max: stress?.maxStressLevel ?? null,
      sleep_duration_minutes: sleepDto?.sleepTimeSeconds
        ? Math.round(sleepDto.sleepTimeSeconds / 60)
        : null,
      sleep_quality: sleepDto?.sleepScores?.overall?.qualifierKey ?? null,
    };

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('garmin_data')
      .upsert(row, { onConflict: 'user_id,date' })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getRecentActivities(accessToken: string, limit = 5) {
    await this.verifyUser(accessToken);
    const garmin = await this.getGarmin();
    const activities = (await garmin.getActivities(0, limit)) as any[];

    return (activities ?? []).map((activity) => ({
      id: activity.activityId,
      name: activity.activityName,
      startTimeLocal: activity.startTimeLocal,
      durationMinutes: activity.duration ? Math.round(activity.duration / 60) : null,
      distanceKm: activity.distance ? Math.round((activity.distance / 1000) * 100) / 100 : null,
      calories: activity.calories ?? null,
      averageHr: activity.averageHR ?? null,
      maxHr: activity.maxHR ?? null,
      type: activity.activityType?.typeKey ?? null,
    }));
  }
}
