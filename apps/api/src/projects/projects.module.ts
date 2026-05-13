import { Module } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, AuditService],
})
export class ProjectsModule {}

