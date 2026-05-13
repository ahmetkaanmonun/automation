import { Module } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { TestFilesController } from './test-files.controller';
import { TestFilesService } from './test-files.service';

@Module({
  controllers: [TestFilesController],
  providers: [TestFilesService, AuditService],
})
export class TestFilesModule {}

