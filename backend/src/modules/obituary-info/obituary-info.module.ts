import { Module } from '@nestjs/common';
import { ObituaryInfoController } from './obituary-info.controller';
import { ObituaryInfoService } from './obituary-info.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObituaryInfo } from '../../entities/obituary-info.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ObituaryInfo])
  ],
  controllers: [ObituaryInfoController],
  providers: [ObituaryInfoService],
})
export class ObituaryInfoModule {}
