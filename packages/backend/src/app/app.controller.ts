import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SupabaseService } from './supabase/supabase.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('health/supabase')
  async checkSupabase() {
    const { error } = await this.supabaseService
      .getClient()
      .auth.admin.listUsers({ page: 1, perPage: 1 });

    return { connected: !error, error: error?.message ?? null };
  }
}
