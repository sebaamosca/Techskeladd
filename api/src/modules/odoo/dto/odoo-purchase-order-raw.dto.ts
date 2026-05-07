export interface OdooPurchaseOrderRaw {
  id: number;
  name: string;
  partner_id: [number, string];
  state: 'draft' | 'sent' | 'to approve' | 'purchase' | 'done' | 'cancel';
  date_order: string;
  amount_total: number;
  order_line: number[]; // Usually just IDs in a summary search
}
