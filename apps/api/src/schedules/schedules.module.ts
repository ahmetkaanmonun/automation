import { Module } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { ExecutionsModule } from '../executions/executions.module';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

@Module({
  imports: [ExecutionsModule],
  controllers: [SchedulesController],
  providers: [SchedulesService, AuditService],
})
export class SchedulesModule {}

