import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditService } from '../common/audit.service';
import { CryptoService } from './crypto.service';
import { TestDataController } from './test-data.controller';
import { TestDataService } from './test-data.service';

@Module({
  imports: [ConfigModule],
  controllers: [TestDataController],
  providers: [TestDataService, CryptoService, AuditService],
  exports: [TestDataService, CryptoService],
})
export class TestDataModule {}

