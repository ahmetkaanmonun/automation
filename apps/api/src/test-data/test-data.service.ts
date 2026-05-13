import { Injectable } from '@nestjs/common';
import { Environment, Prisma } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from './crypto.service';
import { TestDataDto } from './test-data.dto';

type Query = {
  projectId?: string;
  moduleId?: string;
  environment?: string;
};

@Injectable()
export class TestDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly audit: AuditService,
  ) {}

  list(query: Query) {
    return this.prisma.testData
      .findMany({
        where: {
          projectId: query.projectId,
          moduleId: query.moduleId,
          environment: query.environment as Environment | undefined,
        },
        include: { project: true, module: true },
        orderBy: { updatedAt: 'desc' },
      })
      .then((items) => items.map((item) => this.mask(item)));
  }

  async create(userId: string, dto: TestDataDto) {
    const item = await this.prisma.testData.create({ data: this.toCreateData(dto) });
    await this.audit.record({ userId, action: 'CREATE', entityType: 'TestData', entityId: item.id, after: this.mask(item) });
    return this.mask(item);
  }

  async update(userId: string, id: string, dto: Partial<TestDataDto>) {
    const before = await this.prisma.testData.findUniqueOrThrow({ where: { id } });
    const item = await this.prisma.testData.update({ where: { id }, data: this.toUpdateData(dto) });
    await this.audit.record({
      userId,
      action: 'UPDATE',
      entityType: 'TestData',
      entityId: id,
      before: this.mask(before),
      after: this.mask(item),
    });
    return this.mask(item);
  }

  async remove(userId: string, id: string) {
    const before = await this.prisma.testData.findUniqueOrThrow({ where: { id } });
    const item = await this.prisma.testData.update({ where: { id }, data: { active: false } });
    await this.audit.record({ userId, action: 'DISABLE', entityType: 'TestData', entityId: id, before: this.mask(before), after: this.mask(item) });
    return this.mask(item);
  }

  async resolveValue(id: string) {
    const item = await this.prisma.testData.findUniqueOrThrow({ where: { id } });
    if (item.isSecret && item.encryptedValue) {
      return this.crypto.decrypt(item.encryptedValue);
    }
    return item.value ?? '';
  }

  private toCreateData(dto: TestDataDto): Prisma.TestDataUncheckedCreateInput {
    const isSecret = dto.isSecret ?? false;
    return {
      projectId: dto.projectId,
      moduleId: dto.moduleId,
      environment: dto.environment,
      key: dto.key,
      value: isSecret ? null : dto.value,
      encryptedValue: isSecret && dto.value ? this.crypto.encrypt(dto.value) : undefined,
      isSecret: dto.isSecret,
      description: dto.description,
      active: dto.active,
    };
  }

  private toUpdateData(dto: Partial<TestDataDto>): Prisma.TestDataUncheckedUpdateInput {
    const isSecret = dto.isSecret ?? false;
    return {
      projectId: dto.projectId,
      moduleId: dto.moduleId,
      environment: dto.environment,
      key: dto.key,
      value: isSecret ? null : dto.value,
      encryptedValue: isSecret && dto.value ? this.crypto.encrypt(dto.value) : undefined,
      isSecret: dto.isSecret,
      description: dto.description,
      active: dto.active,
    };
  }

  private mask<T extends { isSecret: boolean; encryptedValue: string | null; value: string | null }>(item: T) {
    return {
      ...item,
      encryptedValue: undefined,
      value: item.isSecret ? '********' : item.value,
    };
  }
}
