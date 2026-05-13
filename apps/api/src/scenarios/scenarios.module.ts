import { Module } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';

@Module({
  controllers: [ScenariosController],
  providers: [ScenariosService, AuditService],
  exports: [ScenariosService],
})
export class ScenariosModule {}

