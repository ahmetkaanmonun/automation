import { Injectable } from '@nestjs/common';
import { Environment, Prisma } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScenarioDto } from './scenarios.dto';

type Query = {
  projectId?: string;
  moduleId?: string;
  environment?: string;
  tag?: string;
};

const scenarioInclude = {
  project: true,
  module: true,
  createdBy: { select: { id: true, fullName: true, email: true } },
  updatedBy: { select: { id: true, fullName: true, email: true } },
  steps: {
    include: { locator: true, testData: true },
    orderBy: { orderIndex: 'asc' as const },
  },
};

@Injectable()
export class ScenariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(query: Query) {
    const where: Prisma.TestScenarioWhereInput = {
      projectId: query.projectId,
      moduleId: query.moduleId,
      environment: query.environment as Environment | undefined,
      active: true,
      tags: query.tag ? { has: query.tag } : undefined,
    };
    return this.prisma.testScenario.findMany({ where, include: scenarioInclude, orderBy: { updatedAt: 'desc' } });
  }

  get(id: string) {
    return this.prisma.testScenario.findUniqueOrThrow({ where: { id }, include: scenarioInclude });
  }

  async create(userId: string, dto: ScenarioDto) {
    const scenario = await this.prisma.testScenario.create({
      data: {
        projectId: dto.projectId,
        moduleId: dto.moduleId,
        environment: dto.environment,
        name: dto.name,
        description: dto.description,
        tags: dto.tags ?? [],
        active: dto.active ?? true,
        createdById: userId,
        steps: { create: dto.steps },
      },
      include: scenarioInclude,
    });
    await this.audit.record({ userId, action: 'CREATE', entityType: 'TestScenario', entityId: scenario.id, after: scenario });
    return scenario;
  }

  async update(userId: string, id: string, dto: ScenarioDto) {
    const before = await this.get(id);
    const scenario = await this.prisma.$transaction(async (tx) => {
      await tx.testStep.deleteMany({ where: { scenarioId: id } });
      return tx.testScenario.update({
        where: { id },
        data: {
          projectId: dto.projectId,
          moduleId: dto.moduleId,
          environment: dto.environment,
          name: dto.name,
          description: dto.description,
          tags: dto.tags ?? [],
          active: dto.active ?? true,
          version: { increment: 1 },
          updatedById: userId,
          steps: { create: dto.steps },
        },
        include: scenarioInclude,
      });
    });
    await this.audit.record({ userId, action: 'UPDATE', entityType: 'TestScenario', entityId: id, before, after: scenario });
    return scenario;
  }

  async clone(userId: string, id: string) {
    const source = await this.get(id);
    const clone = await this.prisma.testScenario.create({
      data: {
        projectId: source.projectId,
        moduleId: source.moduleId,
        environment: source.environment,
        name: `${source.name} Copy`,
        description: source.description,
        tags: source.tags,
        createdById: userId,
        steps: {
          create: source.steps.map((step) => ({
            orderIndex: step.orderIndex,
            name: step.name,
            action: step.action,
            locatorId: step.locatorId,
            testDataId: step.testDataId,
            inputValue: step.inputValue,
            expectedValue: step.expectedValue,
            timeoutMs: step.timeoutMs,
            continueOnFail: step.continueOnFail,
          })),
        },
      },
      include: scenarioInclude,
    });
    await this.audit.record({ userId, action: 'CLONE', entityType: 'TestScenario', entityId: clone.id, before: source, after: clone });
    return clone;
  }

  async remove(userId: string, id: string) {
    const before = await this.get(id);
    const scenario = await this.prisma.testScenario.update({ where: { id }, data: { active: false }, include: scenarioInclude });
    await this.audit.record({ userId, action: 'DISABLE', entityType: 'TestScenario', entityId: id, before, after: scenario });
    return scenario;
  }
}
