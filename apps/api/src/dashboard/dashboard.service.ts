import { Injectable } from '@nestjs/common';
import { ExecutionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [scenarioCount, locatorCount, executions, recentExecutions, modules] = await Promise.all([
      this.prisma.testScenario.count({ where: { active: true } }),
      this.prisma.locator.count({ where: { active: true } }),
      this.prisma.execution.groupBy({ by: ['status'], _count: true }),
      this.prisma.execution.findMany({
        include: { scenario: { include: { module: true } }, startedBy: { select: { fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.prisma.module.findMany({
        include: {
          _count: { select: { scenarios: true, locators: true } },
        },
        take: 8,
      }),
    ]);

    const totalRuns = executions.reduce((sum, item) => sum + item._count, 0);
    const passed = executions.find((item) => item.status === ExecutionStatus.PASSED)?._count ?? 0;
    const failed = executions.find((item) => item.status === ExecutionStatus.FAILED)?._count ?? 0;

    return {
      scenarioCount,
      locatorCount,
      successRate: totalRuns ? Math.round((passed / totalRuns) * 100) : 0,
      failureRate: totalRuns ? Math.round((failed / totalRuns) * 100) : 0,
      recentExecutions,
      modules,
    };
  }
}

