import { Controller, Get, Headers, Post, Query, UnauthorizedException } from '@nestjs/common';
import { GarminService } from './garmin.service';

function extractToken(authHeader?: string): string {
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  if (!token) {
    throw new UnauthorizedException('Falta el token de autenticación.');
  }
  return token;
}

@Controller('garmin')
export class GarminController {
  constructor(private readonly garminService: GarminService) {}

  @Post('sync')
  async sync(@Headers('authorization') authHeader?: string, @Query('date') date?: string) {
    const token = extractToken(authHeader);
    const targetDate = date || new Date().toISOString().slice(0, 10);
    return this.garminService.syncDay(token, targetDate);
  }

  @Get('activities')
  async activities(@Headers('authorization') authHeader?: string, @Query('limit') limit?: string) {
    const token = extractToken(authHeader);
    return this.garminService.getRecentActivities(token, limit ? parseInt(limit, 10) : 5);
  }
}
