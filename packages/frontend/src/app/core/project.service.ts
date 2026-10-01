import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  goal: string | null;
  target_date: string | null;
  status: string;
  created_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  target_date: string | null;
  completed: boolean;
  completed_at: string | null;
}

export interface ProjectTask {
  id: string;
  milestone_id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private readonly supabase: SupabaseService) {}

  async getProjects(): Promise<Project[]> {
    const { data } = await this.supabase.client
      .from('projects')
      .select('id, name, description, goal, target_date, status, created_at')
      .order('created_at', { ascending: true });

    return (data ?? []) as Project[];
  }

  async getProject(id: string): Promise<Project | null> {
    const { data } = await this.supabase.client
      .from('projects')
      .select('id, name, description, goal, target_date, status, created_at')
      .eq('id', id)
      .maybeSingle();

    return (data as Project) ?? null;
  }

  async createProject(input: {
    name: string;
    description: string | null;
    goal: string | null;
    target_date: string | null;
  }): Promise<Project> {
    const { data: userData } = await this.supabase.client.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      throw new Error('No hay sesión activa.');
    }

    const { data, error } = await this.supabase.client
      .from('projects')
      .insert({ user_id: userId, ...input })
      .select('id, name, description, goal, target_date, status, created_at')
      .single();

    if (error) {
      throw error;
    }

    return data as Project;
  }

  async getMilestones(projectId: string): Promise<ProjectMilestone[]> {
    const { data } = await this.supabase.client
      .from('project_milestones')
      .select('id, project_id, title, target_date, completed, completed_at')
      .eq('project_id', projectId)
      .order('target_date', { ascending: true, nullsFirst: false });

    return (data ?? []) as ProjectMilestone[];
  }

  async createMilestone(
    projectId: string,
    title: string,
    targetDate: string | null,
  ): Promise<ProjectMilestone> {
    const { data, error } = await this.supabase.client
      .from('project_milestones')
      .insert({ project_id: projectId, title, target_date: targetDate })
      .select('id, project_id, title, target_date, completed, completed_at')
      .single();

    if (error) {
      throw error;
    }

    return data as ProjectMilestone;
  }

  async toggleMilestone(milestone: ProjectMilestone): Promise<ProjectMilestone> {
    const completed = !milestone.completed;
    const { data, error } = await this.supabase.client
      .from('project_milestones')
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq('id', milestone.id)
      .select('id, project_id, title, target_date, completed, completed_at')
      .single();

    if (error) {
      throw error;
    }

    return data as ProjectMilestone;
  }

  async getTasks(milestoneIds: string[]): Promise<ProjectTask[]> {
    if (milestoneIds.length === 0) {
      return [];
    }

    const { data } = await this.supabase.client
      .from('project_tasks')
      .select('id, milestone_id, title, description, status, due_date')
      .in('milestone_id', milestoneIds)
      .order('due_date', { ascending: true, nullsFirst: false });

    return (data ?? []) as ProjectTask[];
  }

  async createTask(milestoneId: string, title: string): Promise<ProjectTask> {
    const { data, error } = await this.supabase.client
      .from('project_tasks')
      .insert({ milestone_id: milestoneId, title })
      .select('id, milestone_id, title, description, status, due_date')
      .single();

    if (error) {
      throw error;
    }

    return data as ProjectTask;
  }

  async toggleTaskStatus(task: ProjectTask): Promise<ProjectTask> {
    const status = task.status === 'done' ? 'pending' : 'done';
    const { data, error } = await this.supabase.client
      .from('project_tasks')
      .update({ status })
      .eq('id', task.id)
      .select('id, milestone_id, title, description, status, due_date')
      .single();

    if (error) {
      throw error;
    }

    return data as ProjectTask;
  }
}
