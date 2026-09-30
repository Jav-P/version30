import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface WeightLog {
  id: string;
  date: string;
  weight_kg: number;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class WeightService {
  constructor(private readonly supabase: SupabaseService) {}

  async logToday(weightKg: number): Promise<WeightLog> {
    const { data: userData } = await this.supabase.client.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      throw new Error('No hay sesión activa.');
    }

    const date = new Date().toISOString().slice(0, 10);

    const { data, error } = await this.supabase.client
      .from('weight_logs')
      .upsert({ user_id: userId, date, weight_kg: weightKg }, { onConflict: 'user_id,date' })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data as WeightLog;
  }

  async getHistory(limit = 30): Promise<WeightLog[]> {
    const { data } = await this.supabase.client
      .from('weight_logs')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);

    return (data ?? []) as WeightLog[];
  }
}
