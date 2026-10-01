import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface DailyCheck {
  id: string;
  date: string;
  stress_subjective: number | null;
  mood: number | null;
  english_attended: boolean;
  english_notes: string | null;
  work_summary: string | null;
  created_at: string;
}

export interface DailyCheckInput {
  stress_subjective: number | null;
  mood: number | null;
  english_attended: boolean;
  english_notes: string | null;
  work_summary: string | null;
}

@Injectable({ providedIn: 'root' })
export class DailyCheckService {
  constructor(private readonly supabase: SupabaseService) {}

  async getToday(): Promise<DailyCheck | null> {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await this.supabase.client
      .from('daily_checks')
      .select('id, date, stress_subjective, mood, english_attended, english_notes, work_summary, created_at')
      .eq('date', today)
      .maybeSingle();

    return (data as DailyCheck) ?? null;
  }

  async saveToday(input: DailyCheckInput): Promise<DailyCheck> {
    const { data: userData } = await this.supabase.client.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      throw new Error('No hay sesión activa.');
    }

    const date = new Date().toISOString().slice(0, 10);

    const { data, error } = await this.supabase.client
      .from('daily_checks')
      .upsert({ user_id: userId, date, ...input }, { onConflict: 'user_id,date' })
      .select('id, date, stress_subjective, mood, english_attended, english_notes, work_summary, created_at')
      .single();

    if (error) {
      throw error;
    }

    return data as DailyCheck;
  }

  async getHistory(limit = 14): Promise<DailyCheck[]> {
    const { data } = await this.supabase.client
      .from('daily_checks')
      .select('id, date, stress_subjective, mood, english_attended, english_notes, work_summary, created_at')
      .order('date', { ascending: false })
      .limit(limit);

    return (data ?? []) as DailyCheck[];
  }
}
