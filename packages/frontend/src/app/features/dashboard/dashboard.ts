import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { FoodService } from '../../core/food.service';
import { GarminDaySummary, GarminService } from '../../core/garmin.service';
import { readStoredRoutineLocation, RoutineDay, TrainingService, WorkoutLog } from '../../core/training.service';
import { WeightLog, WeightService } from '../../core/weight.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  readonly routineDay = signal<RoutineDay | null>(null);
  readonly routineLog = signal<WorkoutLog | null>(null);
  readonly consumedToday = signal(0);
  readonly latestWeight = signal<WeightLog | null>(null);
  readonly garminToday = signal<GarminDaySummary | null>(null);
  readonly streak = signal(0);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly trainingService: TrainingService,
    private readonly foodService: FoodService,
    private readonly weightService: WeightService,
    private readonly garminService: GarminService,
  ) {}

  get email() {
    return this.authService.session()?.user.email;
  }

  async ngOnInit() {
    const today = new Date();
    const isoToday = today.toISOString().slice(0, 10);
    const location = readStoredRoutineLocation();

    const day = await this.trainingService.getRoutineForDate(today, location);
    this.routineDay.set(day);
    if (day) {
      this.routineLog.set(
        await this.trainingService.getOrCreateLog(today, day.is_rest_day ? null : day.id),
      );
    }

    const foodLogs = await this.foodService.getRecentLogs(30);
    this.consumedToday.set(
      foodLogs
        .filter((log) => log.date === isoToday)
        .reduce((sum, log) => sum + (log.calories ?? 0), 0),
    );

    const weightHistory = await this.weightService.getHistory(1);
    this.latestWeight.set(weightHistory[0] ?? null);

    this.garminToday.set(await this.garminService.getToday());
    this.streak.set(await this.trainingService.getWorkoutStreak());
  }

  get routineProgress(): string | null {
    const day = this.routineDay();
    if (!day || day.is_rest_day) {
      return null;
    }
    const completed = this.routineLog()?.completed_exercise_ids.length ?? 0;
    return `${completed}/${day.exercises.length}`;
  }

  get calorieBalance(): number | null {
    const burned = this.garminToday()?.calories;
    if (burned == null) {
      return null;
    }
    return burned - this.consumedToday();
  }

  abs(value: number): number {
    return Math.abs(value);
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigateByUrl('/login');
  }
}
