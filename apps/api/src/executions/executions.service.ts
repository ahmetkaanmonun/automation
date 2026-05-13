import { Injectable, OnModuleInit } from '@nestjs/common';
import { ExecutionStatus } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { StartExecutionDto } from './executions.dto';
import { ExecutionStepError, PlaywrightRunnerService } from './playwright-runner.service';

@Injectable()
export class ExecutionsService implements OnModuleInit {
  private readonly queue: string[] = [];
  private active = 0;
  private readonly concurrency = 2;

  constructor(
    private readonly prisma: PrismaService,
    private readonly runner: PlaywrightRunnerService,
    private readonly audit: AuditService,
  ) {}

  onModuleInit() {
    setInterval(() => void this.drain(), 1000);
  }

  list() {
    return this.prisma.execution.findMany({
      include: {
        scenario: { include: { module: true } },
        startedBy: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  get(id: string) {
    return this.prisma.execution.findUniqueOrThrow({
      where: { id },
      include: {
        scenario: { include: { project: true, module: true, steps: { orderBy: { orderIndex: 'asc' } } } },
        logs: { orderBy: { createdAt: 'asc' } },
        startedBy: { select: { id: true, fullName: true, email: true } },
        report: true,
      },
    });
  }

  logs(id: string) {
    return this.prisma.executionLog.findMany({ where: { executionId: id }, orderBy: { createdAt: 'asc' } });
  }

  async start(userId: string, dto: StartExecutionDto) {
    const execution = await this.prisma.execution.create({
      data: {
        scenarioId: dto.scenarioId,
        environment: dto.environment,
        startedById: userId,
        status: ExecutionStatus.PENDING,
      },
    });
    await this.prisma.executionLog.create({
      data: { executionId: execution.id, status: ExecutionStatus.PENDING, message: 'Execution queued.' },
    });
    await this.audit.record({ userId, action: 'START', entityType: 'Execution', entityId: execution.id, after: execution });
    this.queue.push(execution.id);
    void this.drain();
    return execution;
  }

  async retry(userId: string, id: string) {
    const source = await this.prisma.execution.findUniqueOrThrow({ where: { id } });
    const execution = await this.prisma.execution.create({
      data: {
        scenarioId: source.scenarioId,
        environment: source.environment,
        startedById: userId,
        retryCount: source.retryCount + 1,
      },
    });
    this.queue.push(execution.id);
    await this.audit.record({ userId, action: 'RETRY', entityType: 'Execution', entityId: execution.id, before: source, after: execution });
    void this.drain();
    return execution;
  }

  private async drain() {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const id = this.queue.shift();
      if (!id) {
        return;
      }
      this.active += 1;
      void this.runOne(id).finally(() => {
        this.active -= 1;
      });
    }
  }

  private async runOne(id: string) {
    const startedAt = new Date();
    await this.prisma.execution.update({ where: { id }, data: { status: ExecutionStatus.RUNNING, startedAt } });
    await this.prisma.executionLog.create({
      data: { executionId: id, status: ExecutionStatus.RUNNING, message: 'Execution started.' },
    });

    try {
      await this.runner.run(id);
      const finishedAt = new Date();
      await this.prisma.execution.update({
        where: { id },
        data: {
          status: ExecutionStatus.PASSED,
          finishedAt,
          durationMs: finishedAt.getTime() - startedAt.getTime(),
          report: { create: {} },
        },
      });
      await this.prisma.executionLog.create({
        data: { executionId: id, status: ExecutionStatus.PASSED, message: 'Execution passed.' },
      });
    } catch (error) {
      const finishedAt = new Date();
      const message = error instanceof Error ? error.message : 'Unknown execution error';
      await this.prisma.execution.update({
        where: { id },
        data: {
          status: ExecutionStatus.FAILED,
          finishedAt,
          durationMs: finishedAt.getTime() - startedAt.getTime(),
          errorMessage: message,
          screenshotPath: error instanceof ExecutionStepError ? error.screenshotPath : undefined,
          report: { create: {} },
        },
      });
      await this.prisma.executionLog.create({
        data: { executionId: id, status: ExecutionStatus.FAILED, message },
      });
    }
  }
}
