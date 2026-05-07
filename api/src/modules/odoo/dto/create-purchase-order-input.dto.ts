import {
  IsNumber,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseOrderLineInput {
  @IsNumber()
  @IsNotEmpty()
  productId!: number;

  @IsNumber()
  @Min(0.01)
  quantity!: number;
}

export class CreatePurchaseOrderInput {
  @IsNumber()
  @IsNotEmpty()
  partnerId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderLineInput)
  lines!: PurchaseOrderLineInput[];
}
