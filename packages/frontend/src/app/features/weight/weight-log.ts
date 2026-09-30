import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WeightLog, WeightService } from '../../core/weight.service';

interface WeightRow {
  log: WeightLog;
  deltaFromPrevious: number | null;
}

@Component({
  selector: 'app-weight-log',
  imports: [FormsModule, RouterLink],
  templateUrl: './weight-log.html',
})
export class WeightLogPage implements OnInit {
  readonly history = signal<WeightLog[]>([]);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  input = '';

  constructor(private readonly weightService: WeightService) {}

  async ngOnInit() {
    this.history.set(await this.weightService.getHistory());
  }

  get latest(): WeightLog | null {
    return this.history()[0] ?? null;
  }

  get rows(): WeightRow[] {
    const logs = this.history();
    return logs.map((log, index) => ({
      log,
      deltaFromPrevious:
        index < logs.length - 1 ? round1(log.weight_kg - logs[index + 1].weight_kg) : null,
    }));
  }

  async save() {
    const value = parseFloat(String(this.input).replace(',', '.'));
    if (!value || value <= 0) {
      this.error.set('Ingresa un peso válido.');
      return;
    }

    this.error.set(null);
    this.saving.set(true);
    try {
      await this.weightService.logToday(value);
      this.history.set(await this.weightService.getHistory());
      this.input = '';
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      this.saving.set(false);
    }
  }
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
