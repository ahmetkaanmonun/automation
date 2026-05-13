import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ExecutionsModule } from './executions/executions.module';
import { HealthModule } from './health/health.module';
import { LocatorsModule } from './locators/locators.module';
import { ModulesModule } from './modules/modules.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { ReportsModule } from './reports/reports.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import { TestDataModule } from './test-data/test-data.module';
import { TestFilesModule } from './test-files/test-files.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    ModulesModule,
    LocatorsModule,
    TestDataModule,
    TestFilesModule,
    ScenariosModule,
    ExecutionsModule,
    DashboardModule,
    ReportsModule,
    SchedulesModule,
  ],
})
export class AppModule {}
