import { IsNumber, IsString } from 'class-validator';

/**
 * Clean reordering rule data.
 */
export class AdaptedReorderingRule {
  @IsNumber()
  id!: number;

  @IsNumber()
  productId!: number;

  @IsString()
  productName!: string;

  @IsNumber()
  minQty!: number;

  @IsNumber()
  maxQty!: number;

  @IsNumber()
  qtyMultiple!: number;

  @IsNumber()
  locationId!: number;

  @IsString()
  locationName!: string;
}
