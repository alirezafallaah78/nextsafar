import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  IsBoolean,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * وضعیت‌های معتبر تور مطابق با Prisma TourStatus enum
 */
export enum AdminTourStatus {
  DRAFT = 'DRAFT',
  READY = 'READY',
  PUBLISHED = 'PUBLISHED',
  SELLING = 'SELLING',
  SOLD_OUT = 'SOLD_OUT',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  INACTIVE = 'INACTIVE',
}

export class TourDateDto {
  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsNumber()
  adultPrice: number;

  @IsOptional()
  @IsNumber()
  childPrice?: number;

  @IsOptional()
  @IsNumber()
  infantPrice?: number;

  @IsOptional()
  @IsNumber()
  singlePrice?: number;

  @IsInt()
  @Type(() => Number)
  totalCapacity: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  remainingCapacity?: number;

  @IsOptional()
  @IsString()
  status?: string; // ACTIVE | FULL | CANCELLED (stored as String in DB)
}

export class TourItineraryDto {
  @IsInt()
  @Type(() => Number)
  dayNumber: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  order?: number;
}

export class TourServiceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isIncluded?: boolean;
}

export class CreateAdminTourDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  destinationId?: string;

  @IsOptional()
  @IsEnum(AdminTourStatus)
  status?: AdminTourStatus;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  durationDays?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  durationNights?: number;

  @IsOptional()
  @IsString()
  transportType?: string;

  @IsOptional()
  images?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourDateDto)
  dates?: TourDateDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourItineraryDto)
  itineraries?: TourItineraryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourServiceDto)
  services?: TourServiceDto[];
}

export class UpdateAdminTourDto extends CreateAdminTourDto {}

export class AdminTourQueryDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AdminTourStatus)
  status?: AdminTourStatus;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  destinationId?: string;
}

export class ChangeTourStatusDto {
  @IsEnum(AdminTourStatus)
  status: AdminTourStatus;
}
