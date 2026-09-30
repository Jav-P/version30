import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface FoodLog {
  id: string;
  date: string;
  image_url: string;
  ai_score: number | null;
  calories: number | null;
  ai_feedback: string | null;
  analyzed_at: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class FoodService {
  constructor(private readonly supabase: SupabaseService) {}

  async uploadAndLog(file: File): Promise<FoodLog> {
    const { data: userData } = await this.supabase.client.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      throw new Error('No hay sesión activa.');
    }

    const extension = file.name.split('.').pop() || 'jpg';
    const path = `${userId}/${Date.now()}.${extension}`;

    const { error: uploadError } = await this.supabase.client.storage
      .from('food-photos')
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = this.supabase.client.storage.from('food-photos').getPublicUrl(path);

    const { data: created, error: insertError } = await this.supabase.client
      .from('food_logs')
      .insert({ user_id: userId, image_url: publicUrl })
      .select('*')
      .single();

    if (insertError) {
      throw insertError;
    }

    return created as FoodLog;
  }

  async analyze(foodLogId: string): Promise<FoodLog> {
    const { data: sessionData } = await this.supabase.client.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      throw new Error('No hay sesión activa.');
    }

    const response = await fetch(`/api/food/analyze/${foodLogId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || 'No se pudo analizar la foto.');
    }

    return response.json();
  }

  async getRecentLogs(limit = 10): Promise<FoodLog[]> {
    const { data } = await this.supabase.client
      .from('food_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data ?? []) as FoodLog[];
  }
}
