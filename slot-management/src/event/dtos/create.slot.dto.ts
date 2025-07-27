import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSlotDto {
  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate: string;

  @IsString()
  endTime: string;

  @IsString()
  startTime: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }): boolean => (typeof value === 'string' ? value.toLowerCase() === 'true' : value))
  isDeleted: boolean;
}
