import { Module } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { LocatorsController } from './locators.controller';
import { LocatorsService } from './locators.service';

@Module({
  controllers: [LocatorsController],
  providers: [LocatorsService, AuditService],
})
export class LocatorsModule {}

