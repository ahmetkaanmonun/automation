import { Environment, ScheduleType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  scenarioId!: string;

  @IsEnum(Environment)
  environment!: Environment;

  @IsEnum(ScheduleType)
  scheduleType!: ScheduleType;

  @IsOptional()
  @IsInt()
  @Min(1)
  intervalMinutes?: number;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  timeOfDay?: string;
}

export class UpdateScheduleDto {
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsEnum(ScheduleType)
  scheduleType?: ScheduleType;

  @IsOptional()
  @IsInt()
  @Min(1)
  intervalMinutes?: number;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  timeOfDay?: string;
}

