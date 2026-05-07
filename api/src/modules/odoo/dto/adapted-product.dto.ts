import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class AdaptedProduct {
  @IsNumber()
  id!: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  sku?: string; // from default_code

  @IsNumber()
  price!: number;

  @IsNumber()
  stock!: number;

  @IsNumber()
  uomId!: number;

  @IsString()
  uomName!: string;

  @IsNumber()
  categoryId!: number;

  @IsString()
  categoryName!: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsDateString()
  lastUpdated!: string;
}
