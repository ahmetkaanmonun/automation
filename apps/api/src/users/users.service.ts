import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';

const userSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list() {
    return this.prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'desc' } });
  }

  async create(actorId: string, dto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        role: dto.role,
        passwordHash: await bcrypt.hash(dto.password, 12),
      },
      select: userSelect,
    });
    await this.audit.record({ userId: actorId, action: 'CREATE', entityType: 'User', entityId: user.id, after: user });
    return user;
  }

  async update(actorId: string, id: string, dto: UpdateUserDto) {
    const before = await this.prisma.user.findUniqueOrThrow({ where: { id }, select: userSelect });
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        role: dto.role,
        active: dto.active,
        passwordHash: dto.password ? await bcrypt.hash(dto.password, 12) : undefined,
      },
      select: userSelect,
    });
    await this.audit.record({ userId: actorId, action: 'UPDATE', entityType: 'User', entityId: id, before, after: user });
    return user;
  }

  async remove(actorId: string, id: string) {
    const before = await this.prisma.user.findUniqueOrThrow({ where: { id }, select: userSelect });
    const user = await this.prisma.user.update({ where: { id }, data: { active: false }, select: userSelect });
    await this.audit.record({ userId: actorId, action: 'DISABLE', entityType: 'User', entityId: id, before, after: user });
    return user;
  }
}

