import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export type RoutineLocation = 'gym' | 'home';

export interface RoutineExercise {
  id: string;
  name: string;
  sets: number | null;
  reps: string | null;
  notes: string | null;
  sort_order: number;
  video_url: string | null;
}

const YOUTUBE_ID_PATTERN = /(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/;

export function youtubeThumbnail(videoUrl: string | null): string | null {
  if (!videoUrl) {
    return null;
  }
  const match = videoUrl.match(YOUTUBE_ID_PATTERN);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export interface RoutineDay {
  id: string;
  name: string;
  is_rest_day: boolean;
  exercises: RoutineExercise[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  routine_day_id: string | null;
  completed_exercise_ids: string[];
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class TrainingService {
  constructor(private readonly supabase: SupabaseService) {}

  private isoDayOfWeek(date: Date): number {
    const jsDay = date.getDay(); // 0 = domingo
    return jsDay === 0 ? 7 : jsDay;
  }

  private isoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  async getRoutineForDate(date: Date, location: RoutineLocation): Promise<RoutineDay | null> {
    const dayOfWeek = this.isoDayOfWeek(date);

    const { data: day, error } = await this.supabase.client
      .from('routine_days')
      .select('id, name, is_rest_day')
      .eq('day_of_week', dayOfWeek)
      .eq('location', location)
      .maybeSingle();

    if (error || !day) {
      return null;
    }

    // No hay foreign key física entre routine_days y routine_exercises
    // (mismo patrón del resto del esquema), así que no se puede usar el
    // embedding automático de PostgREST: se consulta por separado.
    const { data: exercises } = await this.supabase.client
      .from('routine_exercises')
      .select('id, name, sets, reps, notes, sort_order, video_url')
      .eq('routine_day_id', day['id'])
      .order('sort_order', { ascending: true });

    return {
      id: day['id'],
      name: day['name'],
      is_rest_day: day['is_rest_day'],
      exercises: (exercises ?? []) as RoutineExercise[],
    };
  }

  async getOrCreateLog(date: Date, routineDayId: string | null): Promise<WorkoutLog> {
    const isoDate = this.isoDate(date);

    const { data: existing } = await this.supabase.client
      .from('workout_logs')
      .select('*')
      .eq('date', isoDate)
      .maybeSingle();

    if (existing) {
      return existing as WorkoutLog;
    }

    const { data: userData } = await this.supabase.client.auth.getUser();
    const { data: created, error } = await this.supabase.client
      .from('workout_logs')
      .insert({
        user_id: userData.user?.id,
        date: isoDate,
        routine_day_id: routineDayId,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return created as WorkoutLog;
  }

  async toggleExercise(log: WorkoutLog, exerciseId: string): Promise<WorkoutLog> {
    const isCompleted = log.completed_exercise_ids.includes(exerciseId);
    const completedExerciseIds = isCompleted
      ? log.completed_exercise_ids.filter((id) => id !== exerciseId)
      : [...log.completed_exercise_ids, exerciseId];

    const { data, error } = await this.supabase.client
      .from('workout_logs')
      .update({ completed_exercise_ids: completedExerciseIds })
      .eq('id', log.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data as WorkoutLog;
  }

  async setCompleted(log: WorkoutLog, completed: boolean): Promise<WorkoutLog> {
    const { data, error } = await this.supabase.client
      .from('workout_logs')
      .update({ completed })
      .eq('id', log.id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data as WorkoutLog;
  }
}
