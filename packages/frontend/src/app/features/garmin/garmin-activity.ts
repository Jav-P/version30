import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FoodService } from '../../core/food.service';
import { GarminActivity, GarminDaySummary, GarminService } from '../../core/garmin.service';

@Component({
  selector: 'app-garmin-activity',
  imports: [RouterLink],
  templateUrl: './garmin-activity.html',
})
export class GarminActivityPage implements OnInit {
  readonly syncing = signal(false);
  readonly loadingActivities = signal(true);
  readonly error = signal<string | null>(null);
  readonly today = signal<GarminDaySummary | null>(null);
  readonly activities = signal<GarminActivity[]>([]);
  readonly consumedToday = signal(0);

  constructor(
    private readonly garminService: GarminService,
    private readonly foodService: FoodService,
  ) {}

  async ngOnInit() {
    this.today.set(await this.garminService.getToday());
    await this.loadActivities();
    await this.loadConsumedToday();
  }

  private async loadActivities() {
    this.loadingActivities.set(true);
    try {
      this.activities.set(await this.garminService.getActivities());
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Algo salió mal.');
    } finally {
      this.loadingActivities.set(false);
    }
  }

  private async loadConsumedToday() {
    const today = new Date().toISOString().slice(0, 10);
    const logs = await this.foodService.getRecentLogs(30);
    const total = logs
      .filter((log) => log.date === today)
      .reduce((sum, log) => sum + (log.calories ?? 0), 0);
    this.consumedToday.set(total);
  }

  get balance(): number | null {
    const burned = this.today()?.calories;
    if (burned == null) {
      return null;
    }
    return burned - this.consumedToday();
  }

  abs(value: number): number {
    return Math.abs(value);
  }

  async sync() {
    this.error.set(null);
    this.syncing.set(true);
    try {
      this.today.set(await this.garminService.syncToday());
      await this.loadActivities();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No se pudo sincronizar.');
    } finally {
      this.syncing.set(false);
    }
  }
}
