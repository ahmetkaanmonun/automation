import { Injectable } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { ModuleDto } from './modules.dto';

@Injectable()
export class ModulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(projectId?: string) {
    return this.prisma.module.findMany({
      where: { projectId },
      include: { project: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: ModuleDto) {
    const module = await this.prisma.module.create({ data: dto });
    await this.audit.record({ userId, action: 'CREATE', entityType: 'Module', entityId: module.id, after: module });
    return module;
  }

  async update(userId: string, id: string, dto: Partial<ModuleDto>) {
    const before = await this.prisma.module.findUniqueOrThrow({ where: { id } });
    const module = await this.prisma.module.update({ where: { id }, data: dto });
    await this.audit.record({ userId, action: 'UPDATE', entityType: 'Module', entityId: id, before, after: module });
    return module;
  }

  async remove(userId: string, id: string) {
    const before = await this.prisma.module.findUniqueOrThrow({ where: { id } });
    const module = await this.prisma.module.update({ where: { id }, data: { active: false } });
    await this.audit.record({ userId, action: 'DISABLE', entityType: 'Module', entityId: id, before, after: module });
    return module;
  }
}

