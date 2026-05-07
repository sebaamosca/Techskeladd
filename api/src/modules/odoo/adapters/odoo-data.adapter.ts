import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { OdooProductRaw } from '../dto/odoo-product-raw.dto';
import { AdaptedProduct } from '../dto/adapted-product.dto';
import { OdooReorderingRuleRaw } from '../dto/odoo-reordering-rule-raw.dto';
import { AdaptedReorderingRule } from '../dto/adapted-reordering-rule.dto';
import { OdooPurchaseOrderRaw } from '../dto/odoo-purchase-order-raw.dto';
import {
  AdaptedPurchaseOrder,
  PurchaseOrderState,
} from '../dto/adapted-purchase-order.dto';

export class OdooDataAdapter {
  static adaptProduct(raw: OdooProductRaw): AdaptedProduct {
    const data = {
      id: raw.id,
      name: raw.name,
      sku: raw.default_code || undefined,
      price: raw.list_price,
      stock: raw.qty_available,
      uomId: this.extractMany2OneId(raw.uom_id),
      uomName: this.extractMany2OneName(raw.uom_id),
      categoryId: this.extractMany2OneId(raw.categ_id),
      categoryName: this.extractMany2OneName(raw.categ_id),
      barcode: raw.barcode || undefined,
      lastUpdated: raw.write_date,
    };

    return this.validate(AdaptedProduct, data);
  }

  static adaptReorderingRule(
    raw: OdooReorderingRuleRaw,
  ): AdaptedReorderingRule {
    const data = {
      id: raw.id,
      productId: this.extractMany2OneId(raw.product_id),
      productName: this.extractMany2OneName(raw.product_id),
      minQty: raw.product_min_qty,
      maxQty: raw.product_max_qty,
      qtyMultiple: raw.qty_multiple,
      locationId: this.extractMany2OneId(raw.location_id),
      locationName: this.extractMany2OneName(raw.location_id),
    };

    return this.validate(AdaptedReorderingRule, data);
  }

  static adaptPurchaseOrder(raw: OdooPurchaseOrderRaw): AdaptedPurchaseOrder {
    const data = {
      id: raw.id,
      reference: raw.name,
      partnerId: this.extractMany2OneId(raw.partner_id),
      partnerName: this.extractMany2OneName(raw.partner_id),
      state: this.validateState(raw.state),
      dateOrder: raw.date_order,
      total: raw.amount_total,
    };

    return this.validate(AdaptedPurchaseOrder, data);
  }

  private static extractMany2OneId(tuple: unknown): number {
    if (!Array.isArray(tuple) || tuple.length < 1) {
      throw new Error('Invalid Many2One tuple: expected [id, name]');
    }
    return tuple[0] as number;
  }
  static extractMany2OneName(tuple: unknown): string {
    if (!Array.isArray(tuple) || tuple.length < 2) {
      throw new Error('Invalid Many2One tuple: expected [id, name]');
    }
    return tuple[1] as string;
  }

  private static validateState(state: unknown): PurchaseOrderState {
    const validStates = [
      'draft',
      'sent',
      'to approve',
      'purchase',
      'done',
      'cancel',
    ];
    if (!validStates.includes(state as string)) {
      throw new Error(`Invalid purchase order state: ${String(state)}`);
    }
    return state as PurchaseOrderState;
  }

  private static validate<T extends object>(cls: new () => T, data: object): T {
    const instance = plainToInstance(cls, data);
    const errors = validateSync(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const messages = errors
        .map((e) => Object.values(e.constraints || {}).join(', '))
        .join('; ');
      throw new Error(`[OdooDataAdapter] Validation failed: ${messages}`);
    }

    return instance;
  }
}
