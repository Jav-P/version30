import { Controller, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { FoodService } from './food.service';

@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post('analyze/:id')
  async analyze(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    const token = authHeader?.replace(/^Bearer\s+/i, '');
    if (!token) {
      throw new UnauthorizedException('Falta el token de autenticación.');
    }
    return this.foodService.analyzeForUser(id, token);
  }
}
