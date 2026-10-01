import { Component, Input, OnChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Project,
  ProjectMilestone,
  ProjectService,
  ProjectTask,
} from '../../core/project.service';

interface MilestoneWithTasks extends ProjectMilestone {
  tasks: ProjectTask[];
}

@Component({
  selector: 'app-project-detail',
  imports: [FormsModule, RouterLink],
  templateUrl: './project-detail.html',
})
export class ProjectDetailPage implements OnChanges {
  @Input() id!: string;

  readonly project = signal<Project | null>(null);
  readonly milestones = signal<MilestoneWithTasks[]>([]);
  readonly newMilestoneTitle = signal('');
  readonly addingMilestone = signal(false);
  readonly newTaskTitleByMilestone: Record<string, string> = {};

  constructor(private readonly projectService: ProjectService) {}

  async ngOnChanges() {
    if (!this.id) {
      return;
    }
    this.project.set(await this.projectService.getProject(this.id));
    await this.reloadMilestones();
  }

  private async reloadMilestones() {
    const milestones = await this.projectService.getMilestones(this.id);
    const tasks = await this.projectService.getTasks(milestones.map((m) => m.id));

    this.milestones.set(
      milestones.map((m) => ({
        ...m,
        tasks: tasks.filter((t) => t.milestone_id === m.id),
      })),
    );
  }

  get progress(): number {
    const milestones = this.milestones();
    if (milestones.length === 0) {
      return 0;
    }
    const done = milestones.filter((m) => m.completed).length;
    return Math.round((done / milestones.length) * 100);
  }

  async addMilestone() {
    const title = this.newMilestoneTitle().trim();
    if (!title) {
      return;
    }
    this.addingMilestone.set(true);
    try {
      await this.projectService.createMilestone(this.id, title, null);
      this.newMilestoneTitle.set('');
      await this.reloadMilestones();
    } finally {
      this.addingMilestone.set(false);
    }
  }

  async toggleMilestone(milestone: ProjectMilestone) {
    await this.projectService.toggleMilestone(milestone);
    await this.reloadMilestones();
  }

  async addTask(milestoneId: string) {
    const title = (this.newTaskTitleByMilestone[milestoneId] ?? '').trim();
    if (!title) {
      return;
    }
    await this.projectService.createTask(milestoneId, title);
    this.newTaskTitleByMilestone[milestoneId] = '';
    await this.reloadMilestones();
  }

  async toggleTask(task: ProjectTask) {
    await this.projectService.toggleTaskStatus(task);
    await this.reloadMilestones();
  }
}
