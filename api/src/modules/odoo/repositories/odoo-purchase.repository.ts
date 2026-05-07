import { Injectable } from '@nestjs/common';
import { OdooConnectionService } from '../odoo-connection.service';
import { OdooPurchaseOrderRaw } from '../dto/odoo-purchase-order-raw.dto';
import { CreatePurchaseOrderInput } from '../dto/create-purchase-order-input.dto';

@Injectable()
export class OdooPurchaseRepository {
  constructor(private readonly odoo: OdooConnectionService) {}

  async getPurchaseOrderDrafts(
    productId?: number,
  ): Promise<OdooPurchaseOrderRaw[]> {
    const domain: any[] = [['state', '=', 'draft']];
    if (productId) {
      domain.push(['order_line.product_id', '=', productId]);
    }

    return this.odoo.call<OdooPurchaseOrderRaw[]>(
      'purchase.order',
      'search_read',
      [
        domain,
        [
          'id',
          'name',
          'partner_id',
          'state',
          'date_order',
          'amount_total',
          'order_line',
        ],
      ],
    );
  }

  async createPurchaseOrderDraft(
    data: CreatePurchaseOrderInput,
  ): Promise<number> {
    const orderLines = data.lines.map((line) => [
      0,
      0,
      {
        product_id: line.productId,
        product_qty: line.quantity,
      },
    ]);

    return this.odoo.call<number>('purchase.order', 'create', [
      {
        partner_id: data.partnerId,
        order_line: orderLines,
      },
    ]);
  }

  async checkDuplicateDraft(productId: number, date: string): Promise<boolean> {
    const count = await this.odoo.call<number>(
      'purchase.order',
      'search_count',
      [
        [
          ['state', '=', 'draft'],
          ['date_order', '>=', `${date} 00:00:00`],
          ['date_order', '<=', `${date} 23:59:59`],
          ['order_line.product_id', '=', productId],
        ],
      ],
    );

    return count > 0;
  }
}
