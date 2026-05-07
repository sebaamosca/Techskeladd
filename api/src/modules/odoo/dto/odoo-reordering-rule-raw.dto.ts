export interface OdooReorderingRuleRaw {
  id: number;
  product_id: [number, string];
  product_min_qty: number;
  product_max_qty: number;
  qty_multiple: number;
  location_id: [number, string];
}
