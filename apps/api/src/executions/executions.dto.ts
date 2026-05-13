import { Environment } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class StartExecutionDto {
  @IsString()
  scenarioId!: string;

  @IsEnum(Environment)
  environment!: Environment;

  @IsOptional()
  @IsString()
  note?: string;
}

