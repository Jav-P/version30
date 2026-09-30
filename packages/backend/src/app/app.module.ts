import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FoodModule } from './food/food.module';
import { GarminModule } from './garmin/garmin.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'packages/backend/.env',
    }),
    SupabaseModule,
    FoodModule,
    GarminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
