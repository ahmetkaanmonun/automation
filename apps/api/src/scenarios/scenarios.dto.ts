import { Environment, StepAction } from '@prisma/client';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StepDto {
  @IsInt()
  orderIndex!: number;

  @IsString()
  name!: string;

  @IsEnum(StepAction)
  action!: StepAction;

  @IsOptional()
  @IsString()
  locatorId?: string;

  @IsOptional()
  @IsString()
  testDataId?: string;

  @IsOptional()
  @IsString()
  inputValue?: string;

  @IsOptional()
  @IsString()
  expectedValue?: string;

  @IsOptional()
  @IsInt()
  timeoutMs?: number;

  @IsOptional()
  @IsBoolean()
  continueOnFail?: boolean;
}

export class ScenarioDto {
  @IsString()
  projectId!: string;

  @IsString()
  moduleId!: string;

  @IsEnum(Environment)
  environment!: Environment;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps!: StepDto[];
}

