import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FoodService } from '../../core/food.service';
import { GarminService } from '../../core/garmin.service';
import { TrainingService } from '../../core/training.service';
import { WeightLog, WeightService } from '../../core/weight.service';

interface WeightPoint {
  date: string;
  weight_kg: number;
}

interface CalorieDay {
  date: string;
  balance: number;
}

const DEFICIT_COLOR = '#16a34a'; // verde — mismo tono usado en el resto de la app para "déficit/bien"
const SURPLUS_COLOR = '#ea580c'; // naranja — mismo tono usado para "superávit/atención"

@Component({
  selector: 'app-progress',
  imports: [RouterLink],
  templateUrl: './progress.html',
})
export class ProgressPage implements OnInit {
  readonly loading = signal(true);
  readonly streak = signal(0);
  readonly weightPoints = signal<WeightPoint[]>([]);
  readonly calorieDays = signal<CalorieDay[]>([]);

  constructor(
    private readonly trainingService: TrainingService,
    private readonly weightService: WeightService,
    private readonly foodService: FoodService,
    private readonly garminService: GarminService,
  ) {}

  async ngOnInit() {
    const [streak, weightHistory] = await Promise.all([
      this.trainingService.getWorkoutStreak(),
      this.weightService.getHistory(30),
    ]);

    this.streak.set(streak);
    // getHistory viene más-reciente-primero; el gráfico se lee de izquierda (viejo) a derecha (hoy).
    this.weightPoints.set([...weightHistory].reverse().map(toWeightPoint));

    await this.loadCalorieDays();
    this.loading.set(false);
  }

  private async loadCalorieDays() {
    const [garminHistory, foodLogs] = await Promise.all([
      this.garminService.getHistory(14),
      this.foodService.getRecentLogs(200),
    ]);

    const consumedByDate = new Map<string, number>();
    for (const log of foodLogs) {
      consumedByDate.set(log.date, (consumedByDate.get(log.date) ?? 0) + (log.calories ?? 0));
    }

    this.calorieDays.set(
      garminHistory
        .filter((day) => day.calories != null)
        .map((day) => ({
          date: day.date,
          balance: (day.calories as number) - (consumedByDate.get(day.date) ?? 0),
        })),
    );
  }

  get weightChart() {
    const points = this.weightPoints();
    if (points.length === 0) {
      return null;
    }

    const values = points.map((p) => p.weight_kg);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 280;
    const height = 90;
    const padTop = 14;
    const padBottom = 14;
    const usableHeight = height - padTop - padBottom;

    const coords = points.map((p, i) => ({
      x: points.length > 1 ? (i / (points.length - 1)) * width : width / 2,
      y: padTop + usableHeight - ((p.weight_kg - min) / range) * usableHeight,
      value: p.weight_kg,
      date: p.date,
    }));

    return {
      width,
      height,
      polyline: coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' '),
      last: coords[coords.length - 1],
      first: coords[0],
    };
  }

  get calorieChart() {
    const days = this.calorieDays();
    if (days.length === 0) {
      return null;
    }

    const width = 280;
    const height = 100;
    const baselineY = 55;
    const maxBarHalf = 38;
    const maxAbs = Math.max(...days.map((d) => Math.abs(d.balance)), 1);
    const slot = width / days.length;
    const barWidth = Math.min(20, slot - 6);

    const bars = days.map((d, i) => {
      const barHeight = (Math.abs(d.balance) / maxAbs) * maxBarHalf;
      const isDeficit = d.balance >= 0;
      return {
        x: slot * i + (slot - barWidth) / 2,
        y: isDeficit ? baselineY - barHeight : baselineY,
        width: barWidth,
        height: barHeight,
        color: isDeficit ? DEFICIT_COLOR : SURPLUS_COLOR,
        date: d.date,
        value: d.balance,
      };
    });

    return { width, height, baselineY, bars };
  }
}

function toWeightPoint(log: WeightLog): WeightPoint {
  return { date: log.date, weight_kg: log.weight_kg };
}
