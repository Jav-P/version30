import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FoodLog, FoodService } from '../../core/food.service';

@Component({
  selector: 'app-food-log',
  imports: [RouterLink],
  templateUrl: './food-log.html',
})
export class FoodLogPage implements OnInit {
  readonly uploading = signal(false);
  readonly analyzing = signal(false);
  readonly error = signal<string | null>(null);
  readonly current = signal<FoodLog | null>(null);
  readonly history = signal<FoodLog[]>([]);

  constructor(private readonly foodService: FoodService) {}

  async ngOnInit() {
    this.history.set(await this.foodService.getRecentLogs());
  }

  get todayCalories(): number {
    const today = new Date().toISOString().slice(0, 10);
    return this.history()
      .filter((log) => log.date === today)
      .reduce((total, log) => total + (log.calories ?? 0), 0);
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.error.set(null);
    this.current.set(null);
    this.uploading.set(true);

    try {
      const created = await this.foodService.uploadAndLog(file);
      this.current.set(created);
      this.uploading.set(false);
      this.analyzing.set(true);
      this.history.set(await this.foodService.getRecentLogs());

      const analyzed = await this.foodService.analyze(created.id);
      this.current.set(analyzed);
      this.history.set(await this.foodService.getRecentLogs());
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Algo salió mal.');
    } finally {
      this.uploading.set(false);
      this.analyzing.set(false);
      input.value = '';
    }
  }
}
