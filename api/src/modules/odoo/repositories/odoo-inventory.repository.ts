import { Injectable } from '@nestjs/common';
import { OdooConnectionService } from '../odoo-connection.service';
import { OdooProductRaw } from '../dto/odoo-product-raw.dto';
import { OdooReorderingRuleRaw } from '../dto/odoo-reordering-rule-raw.dto';

@Injectable()
export class OdooInventoryRepository {
  constructor(private readonly odoo: OdooConnectionService) {}

  async getProductById(productId: number): Promise<OdooProductRaw> {
    const products = await this.odoo.call<OdooProductRaw[]>(
      'product.product',
      'search_read',
      [
        [['id', '=', productId]],
        [
          'id',
          'name',
          'default_code',
          'list_price',
          'qty_available',
          'uom_id',
          'categ_id',
          'barcode',
          'write_date',
        ],
      ],
    );

    if (!products || products.length === 0) {
      throw new Error(`Product with ID ${productId} not found in Odoo`);
    }

    return products[0];
  }

  async getAllProducts(): Promise<OdooProductRaw[]> {
    return this.odoo.call<OdooProductRaw[]>('product.product', 'search_read', [
      [['active', '=', true]],
      [
        'id',
        'name',
        'default_code',
        'list_price',
        'qty_available',
        'uom_id',
        'categ_id',
        'barcode',
        'write_date',
      ],
    ]);
  }

  async getProductStock(productId: number): Promise<number> {
    const products = await this.odoo.call<Array<{ qty_available: number }>>(
      'product.product',
      'read',
      [[productId], ['qty_available']],
    );

    if (!products || products.length === 0) {
      throw new Error(`Product with ID ${productId} not found in Odoo`);
    }

    return products[0].qty_available;
  }

  async getReorderingRules(): Promise<OdooReorderingRuleRaw[]> {
    return this.odoo.call<OdooReorderingRuleRaw[]>(
      'stock.warehouse.orderpoint',
      'search_read',
      [
        [['active', '=', true]],
        [
          'id',
          'product_id',
          'product_min_qty',
          'product_max_qty',
          'qty_multiple',
          'location_id',
        ],
      ],
    );
  }
}
