import { Injectable } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

type FileQuery = {
  projectId?: string;
  moduleId?: string;
  scenarioId?: string;
};

type CreateFileInput = {
  file: Express.Multer.File;
  projectId: string;
  moduleId?: string;
  scenarioId?: string;
};

@Injectable()
export class TestFilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(query: FileQuery) {
    return this.prisma.testFile.findMany({
      where: query,
      include: { project: true, module: true, scenario: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  get(id: string) {
    return this.prisma.testFile.findUniqueOrThrow({ where: { id } });
  }

  async create(userId: string, input: CreateFileInput) {
    const file = await this.prisma.testFile.create({
      data: {
        projectId: input.projectId,
        moduleId: input.moduleId,
        scenarioId: input.scenarioId,
        originalName: input.file.originalname,
        storageName: input.file.filename,
        mimeType: input.file.mimetype,
        size: input.file.size,
        path: input.file.path,
      },
    });
    await this.audit.record({ userId, action: 'UPLOAD', entityType: 'TestFile', entityId: file.id, after: file });
    return file;
  }

  async remove(userId: string, id: string) {
    const file = await this.prisma.testFile.delete({ where: { id } });
    await this.audit.record({ userId, action: 'DELETE', entityType: 'TestFile', entityId: id, before: file });
    return file;
  }
}

