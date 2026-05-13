import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { LocatorDto } from './locators.dto';

type LocatorQuery = {
  projectId?: string;
  moduleId?: string;
  q?: string;
  active?: string;
};

@Injectable()
export class LocatorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(query: LocatorQuery) {
    const where: Prisma.LocatorWhereInput = {
      projectId: query.projectId,
      moduleId: query.moduleId,
      active: query.active === undefined ? undefined : query.active === 'true',
      OR: query.q
        ? [
            { name: { contains: query.q, mode: 'insensitive' } },
            { value: { contains: query.q, mode: 'insensitive' } },
            { page: { contains: query.q, mode: 'insensitive' } },
          ]
        : undefined,
    };

    return this.prisma.locator.findMany({
      where,
      include: { project: true, module: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  get(id: string) {
    return this.prisma.locator.findUniqueOrThrow({ where: { id }, include: { versions: true } });
  }

  versions(id: string) {
    return this.prisma.locatorVersion.findMany({ where: { locatorId: id }, orderBy: { version: 'desc' } });
  }

  async create(userId: string, dto: LocatorDto) {
    const locator = await this.prisma.locator.create({ data: dto });
    await this.audit.record({ userId, action: 'CREATE', entityType: 'Locator', entityId: locator.id, after: locator });
    return locator;
  }

  async update(userId: string, id: string, dto: Partial<LocatorDto>) {
    const before = await this.prisma.locator.findUniqueOrThrow({ where: { id } });
    const locator = await this.prisma.$transaction(async (tx) => {
      await tx.locatorVersion.create({
        data: {
          locatorId: before.id,
          version: before.version,
          type: before.type,
          value: before.value,
          description: before.description,
          page: before.page,
        },
      });

      return tx.locator.update({
        where: { id },
        data: {
          ...dto,
          version: { increment: 1 },
        },
      });
    });
    await this.audit.record({ userId, action: 'UPDATE', entityType: 'Locator', entityId: id, before, after: locator });
    return locator;
  }

  async remove(userId: string, id: string) {
    const before = await this.prisma.locator.findUniqueOrThrow({ where: { id } });
    const locator = await this.prisma.locator.update({ where: { id }, data: { active: false } });
    await this.audit.record({ userId, action: 'DISABLE', entityType: 'Locator', entityId: id, before, after: locator });
    return locator;
  }
}

