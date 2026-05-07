import { IsNumber, IsString, IsDateString, IsEnum } from 'class-validator';

export enum PurchaseOrderState {
  DRAFT = 'draft',
  SENT = 'sent',
  TO_APPROVE = 'to approve',
  PURCHASE = 'purchase',
  DONE = 'done',
  CANCEL = 'cancel',
}

/**
 * Clean purchase order data.
 */
export class AdaptedPurchaseOrder {
  @IsNumber()
  id!: number;

  @IsString()
  reference!: string;

  @IsNumber()
  partnerId!: number;

  @IsString()
  partnerName!: string;

  @IsEnum(PurchaseOrderState)
  state!: PurchaseOrderState;

  @IsDateString()
  dateOrder!: string;

  @IsNumber()
  total!: number;
}
