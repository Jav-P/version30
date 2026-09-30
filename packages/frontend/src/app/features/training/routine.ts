import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  RoutineDay,
  RoutineLocation,
  TrainingService,
  WorkoutLog,
  youtubeThumbnail,
} from '../../core/training.service';

const LOCATION_STORAGE_KEY = 'version30.routineLocation';

function readStoredLocation(): RoutineLocation {
  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    return stored === 'home' ? 'home' : 'gym';
  } catch {
    return 'gym';
  }
}

@Component({
  selector: 'app-routine',
  imports: [RouterLink],
  templateUrl: './routine.html',
})
export class Routine implements OnInit {
  readonly loading = signal(true);
  readonly location = signal<RoutineLocation>(readStoredLocation());
  readonly routineDay = signal<RoutineDay | null>(null);
  readonly log = signal<WorkoutLog | null>(null);

  constructor(private readonly trainingService: TrainingService) {}

  async ngOnInit() {
    await this.loadRoutine();
  }

  async setLocation(location: RoutineLocation) {
    if (this.location() === location) {
      return;
    }
    this.location.set(location);
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, location);
    } catch {
      // Preferencia de solo este dispositivo; si no se puede guardar, no pasa nada.
    }
    await this.loadRoutine();
  }

  private async loadRoutine() {
    this.loading.set(true);
    const today = new Date();
    const day = await this.trainingService.getRoutineForDate(today, this.location());
    this.routineDay.set(day);
    this.log.set(null);

    if (day) {
      const log = await this.trainingService.getOrCreateLog(
        today,
        day.is_rest_day ? null : day.id,
      );
      this.log.set(log);
    }

    this.loading.set(false);
  }

  thumbnail(videoUrl: string | null): string | null {
    return youtubeThumbnail(videoUrl);
  }

  isChecked(exerciseId: string): boolean {
    return this.log()?.completed_exercise_ids.includes(exerciseId) ?? false;
  }

  async toggle(exerciseId: string) {
    const current = this.log();
    if (!current) {
      return;
    }
    this.log.set(await this.trainingService.toggleExercise(current, exerciseId));
  }

  get allDone(): boolean {
    const day = this.routineDay();
    const log = this.log();
    if (!day || !log || day.exercises.length === 0) {
      return false;
    }
    return day.exercises.every((exercise) => log.completed_exercise_ids.includes(exercise.id));
  }

  get completedCount(): number {
    return this.log()?.completed_exercise_ids.length ?? 0;
  }

  get progressPercent(): number {
    const total = this.routineDay()?.exercises.length ?? 0;
    if (total === 0) {
      return 0;
    }
    return Math.round((this.completedCount / total) * 100);
  }

  async finishDay() {
    const current = this.log();
    if (!current) {
      return;
    }
    this.log.set(await this.trainingService.setCompleted(current, true));
  }
}
