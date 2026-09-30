import { Module } from '@nestjs/common';
import { GarminController } from './garmin.controller';
import { GarminService } from './garmin.service';

@Module({
  controllers: [GarminController],
  providers: [GarminService],
})
export class GarminModule {}
