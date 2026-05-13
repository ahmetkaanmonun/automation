import { Injectable } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectDto } from './projects.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list() {
    return this.prisma.project.findMany({
      include: { modules: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: ProjectDto) {
    const project = await this.prisma.project.create({ data: dto });
    await this.audit.record({ userId, action: 'CREATE', entityType: 'Project', entityId: project.id, after: project });
    return project;
  }

  async update(userId: string, id: string, dto: ProjectDto) {
    const before = await this.prisma.project.findUniqueOrThrow({ where: { id } });
    const project = await this.prisma.project.update({ where: { id }, data: dto });
    await this.audit.record({ userId, action: 'UPDATE', entityType: 'Project', entityId: id, before, after: project });
    return project;
  }

  async remove(userId: string, id: string) {
    const before = await this.prisma.project.findUniqueOrThrow({ where: { id } });
    const project = await this.prisma.project.update({ where: { id }, data: { active: false } });
    await this.audit.record({ userId, action: 'DISABLE', entityType: 'Project', entityId: id, before, after: project });
    return project;
  }
}

