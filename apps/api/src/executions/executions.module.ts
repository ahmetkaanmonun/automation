import { Module } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { TestDataModule } from '../test-data/test-data.module';
import { ExecutionsController } from './executions.controller';
import { ExecutionsService } from './executions.service';
import { PlaywrightRunnerService } from './playwright-runner.service';

@Module({
  imports: [TestDataModule],
  controllers: [ExecutionsController],
  providers: [ExecutionsService, PlaywrightRunnerService, AuditService],
  exports: [ExecutionsService],
})
export class ExecutionsModule {}
