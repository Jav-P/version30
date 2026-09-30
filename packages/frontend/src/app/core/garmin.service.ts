import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface GarminDaySummary {
  id: string;
  date: string;
  steps: number | null;
  calories: number | null;
  active_minutes: number | null;
  stress_avg: number | null;
  stress_max: number | null;
  sleep_duration_minutes: number | null;
  sleep_quality: string | null;
  heart_rate_resting: number | null;
}

export interface GarminActivity {
  id: number;
  name: string;
  startTimeLocal: string;
  durationMinutes: number | null;
  distanceKm: number | null;
  calories: number | null;
  averageHr: number | null;
  maxHr: number | null;
  type: string | null;
}

@Injectable({ providedIn: 'root' })
export class GarminService {
  constructor(private readonly supabase: SupabaseService) {}

  private async authHeader(): Promise<Record<string, string>> {
    const { data } = await this.supabase.client.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      throw new Error('No hay sesión activa.');
    }
    return { Authorization: `Bearer ${token}` };
  }

  async getToday(): Promise<GarminDaySummary | null> {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await this.supabase.client
      .from('garmin_data')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    return (data as GarminDaySummary) ?? null;
  }

  async syncToday(): Promise<GarminDaySummary> {
    const headers = await this.authHeader();
    const response = await fetch('/api/garmin/sync', { method: 'POST', headers });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || 'No se pudo sincronizar con Garmin.');
    }

    return response.json();
  }

  async getActivities(limit = 5): Promise<GarminActivity[]> {
    const headers = await this.authHeader();
    const response = await fetch(`/api/garmin/activities?limit=${limit}`, { headers });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || 'No se pudieron cargar las actividades.');
    }

    return response.json();
  }
}
