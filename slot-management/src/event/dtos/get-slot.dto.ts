import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { SortFields } from '../../common/types';

export class GetSlotDto extends PaginationDto {
  @IsString()
  @IsOptional()
  sortKey?: string;

  @IsString()
  @IsEnum(SortFields)
  @IsOptional()
  sortValue?: string;

  @Transform(({ value }): string => (value as string).trim())
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  startDate: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }): boolean => (typeof value === 'string' ? value.toLowerCase() === 'true' : value))
  isConformed: boolean;

  @IsString()
  @IsOptional()
  userId: string;
}
