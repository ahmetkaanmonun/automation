import { Environment } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class TestDataDto {
  @IsString()
  projectId!: string;

  @IsOptional()
  @IsString()
  moduleId?: string;

  @IsEnum(Environment)
  environment!: Environment;

  @IsString()
  key!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsBoolean()
  isSecret?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

