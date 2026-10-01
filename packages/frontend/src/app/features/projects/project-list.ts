import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Project, ProjectService } from '../../core/project.service';

@Component({
  selector: 'app-project-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './project-list.html',
})
export class ProjectListPage implements OnInit {
  readonly projects = signal<Project[]>([]);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  name = '';
  goal = '';
  targetDate = '';

  constructor(private readonly projectService: ProjectService) {}

  async ngOnInit() {
    this.projects.set(await this.projectService.getProjects());
  }

  async createProject() {
    if (!this.name.trim()) {
      this.error.set('Ponle un nombre al proyecto.');
      return;
    }

    this.error.set(null);
    this.saving.set(true);
    try {
      await this.projectService.createProject({
        name: this.name.trim(),
        description: null,
        goal: this.goal.trim() || null,
        target_date: this.targetDate || null,
      });
      this.projects.set(await this.projectService.getProjects());
      this.name = '';
      this.goal = '';
      this.targetDate = '';
      this.showForm.set(false);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'No se pudo crear el proyecto.');
    } finally {
      this.saving.set(false);
    }
  }
}
