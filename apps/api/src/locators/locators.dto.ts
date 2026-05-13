import { LocatorType } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class LocatorDto {
  @IsString()
  projectId!: string;

  @IsString()
  moduleId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(LocatorType)
  type!: LocatorType;

  @IsString()
  value!: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

