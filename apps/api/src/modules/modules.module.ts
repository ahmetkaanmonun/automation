import { Module } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';

@Module({
  controllers: [ModulesController],
  providers: [ModulesService, AuditService],
})
export class ModulesModule {}

