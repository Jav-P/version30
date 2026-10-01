import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DailyCheck, DailyCheckService } from '../../core/daily-check.service';

@Component({
  selector: 'app-daily-check',
  imports: [FormsModule, RouterLink],
  templateUrl: './daily-check.html',
})
export class DailyCheckPage implements OnInit {
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly error = signal<string | null>(null);
  readonly history = signal<DailyCheck[]>([]);

  stress: number | null = null;
  mood: number | null = null;
  englishAttended = false;
  englishNotes = '';
  workSummary = '';

  constructor(private readonly dailyCheckService: DailyCheckService) {}

  async ngOnInit() {
    const today = await this.dailyCheckService.getToday();
    if (today) {
      this.stress = today.stress_subjective;
      this.mood = today.mood;
      this.englishAttended = today.english_attended;
      this.englishNotes = today.english_notes ?? '';
      this.workSummary = today.work_summary ?? '';
    }
    this.history.set(await this.dailyCheckService.getHistory());
  }

  async save() {
    this.error.set(null);
    this.saved.set(false);
    this.saving.set(true);

    try {
      await this.dailyCheckService.saveToday({
        stress_subjective: this.stress,
        mood: this.mood,
        english_attended: this.englishAttended,
        english_notes: this.englishAttended ? this.englishNotes || null : null,
        work_summary: this.workSummary || null,
      });
      this.saved.set(true);
      this.history.set(await this.dailyCheckService.getHistory());
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      this.saving.set(false);
    }
  }
}
