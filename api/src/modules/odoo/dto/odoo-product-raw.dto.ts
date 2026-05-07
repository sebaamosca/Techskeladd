export interface OdooProductRaw {
  id: number;
  name: string;
  default_code: string | false;
  list_price: number;
  qty_available: number;
  uom_id: [number, string]; // Many2one
  categ_id: [number, string]; // Many2one
  barcode: string | false;
  write_date: string;
}
