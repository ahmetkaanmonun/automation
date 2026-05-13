import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ScheduleType } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { ExecutionsService } from '../executions/executions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto, UpdateScheduleDto } from './schedules.dto';

@Injectable()
export class SchedulesService implements OnModuleInit {
  private processing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly executions: ExecutionsService,
    private readonly audit: AuditService,
  ) {}

  onModuleInit() {
    setInterval(() => void this.processDueSchedules(), 60_000);
    setTimeout(() => void this.processDueSchedules(), 5_000);
  }

  list() {
    return this.prisma.scheduledRun.findMany({
      include: {
        scenario: { include: { module: true, project: true } },
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { nextRunAt: 'asc' },
    });
  }

  async create(userId: string, dto: CreateScheduleDto) {
    this.validateSchedule(dto.scheduleType, dto.intervalMinutes, dto.timeOfDay);
    const schedule = await this.prisma.scheduledRun.create({
      data: {
        scenarioId: dto.scenarioId,
        environment: dto.environment,
        scheduleType: dto.scheduleType,
        intervalMinutes: dto.scheduleType === ScheduleType.INTERVAL ? dto.intervalMinutes : null,
        timeOfDay: dto.scheduleType === ScheduleType.DAILY ? dto.timeOfDay : null,
        nextRunAt: this.computeNextRun(dto.scheduleType, dto.intervalMinutes, dto.timeOfDay),
        createdById: userId,
      },
      include: { scenario: { include: { module: true, project: true } } },
    });
    await this.audit.record({ userId, action: 'CREATE', entityType: 'ScheduledRun', entityId: schedule.id, after: schedule });
    return schedule;
  }

  async update(userId: string, id: string, dto: UpdateScheduleDto) {
    const before = await this.prisma.scheduledRun.findUniqueOrThrow({ where: { id } });
    const scheduleType = dto.scheduleType ?? before.scheduleType;
    const intervalMinutes = dto.intervalMinutes ?? before.intervalMinutes ?? undefined;
    const timeOfDay = dto.timeOfDay ?? before.timeOfDay ?? undefined;
    this.validateSchedule(scheduleType, intervalMinutes, timeOfDay);

    const schedule = await this.prisma.scheduledRun.update({
      where: { id },
      data: {
        active: dto.active,
        scheduleType,
        intervalMinutes: scheduleType === ScheduleType.INTERVAL ? intervalMinutes : null,
        timeOfDay: scheduleType === ScheduleType.DAILY ? timeOfDay : null,
        nextRunAt: dto.scheduleType || dto.intervalMinutes || dto.timeOfDay ? this.computeNextRun(scheduleType, intervalMinutes, timeOfDay) : undefined,
      },
      include: { scenario: { include: { module: true, project: true } } },
    });
    await this.audit.record({ userId, action: 'UPDATE', entityType: 'ScheduledRun', entityId: id, before, after: schedule });
    return schedule;
  }

  async remove(userId: string, id: string) {
    const before = await this.prisma.scheduledRun.findUniqueOrThrow({ where: { id } });
    const schedule = await this.prisma.scheduledRun.delete({ where: { id } });
    await this.audit.record({ userId, action: 'DELETE', entityType: 'ScheduledRun', entityId: id, before });
    return schedule;
  }

  private async processDueSchedules() {
    if (this.processing) return;
    this.processing = true;

    try {
      const due = await this.prisma.scheduledRun.findMany({
        where: { active: true, nextRunAt: { lte: new Date() }, scenario: { active: true } },
        take: 10,
      });

      for (const schedule of due) {
        await this.executions.start(schedule.createdById, {
          scenarioId: schedule.scenarioId,
          environment: schedule.environment,
        });
        await this.prisma.scheduledRun.update({
          where: { id: schedule.id },
          data: {
            lastRunAt: new Date(),
            nextRunAt: this.computeNextRun(schedule.scheduleType, schedule.intervalMinutes ?? undefined, schedule.timeOfDay ?? undefined),
          },
        });
      }
    } finally {
      this.processing = false;
    }
  }

  private validateSchedule(scheduleType: ScheduleType, intervalMinutes?: number | null, timeOfDay?: string | null) {
    if (scheduleType === ScheduleType.INTERVAL && !intervalMinutes) {
      throw new BadRequestException('intervalMinutes is required for interval schedules.');
    }
    if (scheduleType === ScheduleType.DAILY && !timeOfDay) {
      throw new BadRequestException('timeOfDay is required for daily schedules.');
    }
  }

  private computeNextRun(scheduleType: ScheduleType, intervalMinutes?: number | null, timeOfDay?: string | null) {
    const now = new Date();
    if (scheduleType === ScheduleType.INTERVAL) {
      return new Date(now.getTime() + (intervalMinutes ?? 60) * 60_000);
    }

    const [hour, minute] = (timeOfDay ?? '09:00').split(':').map(Number);
    const next = new Date(now);
    next.setHours(hour, minute, 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }
}

