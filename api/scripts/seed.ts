// @ts-nocheck
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore
import * as xmlrpc from 'xmlrpc';

interface OdooConfig {
  url: string;
  db: string;
  username: string;
  password: string;
}

interface XmlRpcClient {
  methodCall(method: string, params: any[], callback: (err: any, value: any) => void): void;
}

const config: OdooConfig = {
  url: process.env.ODOO_URL || 'http://localhost:8069',
  db: process.env.ODOO_DB || 'techskeladd_db',
  username: process.env.ODOO_USERNAME || 'admin',
  password: process.env.ODOO_PASSWORD || 'admin',
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

async function seed() {
  console.log(`${colors.blue}🚀 Starting Idempotent Seeding Process...${colors.reset}`);

  let productImages = {};
  try {
    const imagesPath = path.join(__dirname, 'product_images.json');
    if (fs.existsSync(imagesPath)) productImages = JSON.parse(fs.readFileSync(imagesPath, 'utf8'));
  } catch (e) {}

  let url = config.url;
  if (url.includes('//odoo')) url = url.replace('//odoo', '//localhost');
  const parsedUrl = new URL(url);
  const isHttps = parsedUrl.protocol === 'https:';
  
  const commonClient = xmlrpc.createClient({ host: parsedUrl.hostname, port: parseInt(parsedUrl.port || (isHttps ? '443' : '80'), 10), path: '/xmlrpc/2/common' }) as unknown as XmlRpcClient;
  const objectClient = xmlrpc.createClient({ host: parsedUrl.hostname, port: parseInt(parsedUrl.port || (isHttps ? '443' : '80'), 10), path: '/xmlrpc/2/object' }) as unknown as XmlRpcClient;

  try {
    const uid = await new Promise<number | false>((resolve, reject) => {
      commonClient.methodCall('authenticate', [config.db, config.username, config.password, {}], (err, val) => err ? reject(err) : resolve(val));
    });
    if (!uid) throw new Error('Auth failed');
    
    const execute = <T>(model: string, method: string, args: unknown[]): Promise<T> => {
      return new Promise((resolve, reject) => {
        objectClient.methodCall('execute_kw', [config.db, uid, config.password, model, method, args, {}], (err, val) => {
          if (err) {
            if (err.faultString && err.faultString.includes('cannot marshal None')) return resolve(true as unknown as T);
            return reject(err);
          }
          resolve(val);
        });
      });
    };

    console.log(`${colors.blue}🔓 Elevating user permissions and fixing timezone...${colors.reset}`);
    await execute('res.users', 'write', [[uid], { tz: 'UTC' }]); // Fix for Postgres timezone errors
    const groups = ['sales_team.group_sale_manager', 'stock.group_stock_manager', 'account.group_account_invoice', 'purchase.group_purchase_manager'];
    for (const xmlId of groups) {
      const [mod, name] = xmlId.split('.');
      const gData = await execute<any[]>('ir.model.data', 'search_read', [[['module', '=', mod], ['name', '=', name]], ['res_id']]);
      if (gData.length > 0) await execute('res.users', 'write', [[uid], { groups_id: [[4, gData[0].res_id]] }]);
    }

    const categoryNames = ['PC Components', 'Peripherals & Displays'];
    const catMap: Record<string, number> = {};
    for (const name of categoryNames) {
      const existing = await execute<any[]>('product.category', 'search_read', [[['name', '=', name]], ['id']]);
      catMap[name] = existing.length > 0 ? existing[0].id : await execute<number>('product.category', 'create', [{ name }]);
    }

    const customerNames = ['Demo Customer', 'Nexus Solutions', 'EcoTech Systems'];
    const customerIds: number[] = [];
    for (const name of customerNames) {
      const existing = await execute<any[]>('res.partner', 'search_read', [[['name', '=', name]], ['id']]);
      customerIds.push(existing.length > 0 ? existing[0].id : await execute<number>('res.partner', 'create', [{ name, is_company: true, customer_rank: 1 }]));
    }

    const vendorMap: Record<string, number> = {};
    for (const name of ['Global Components Inc.', 'Peripheral World Ltd.']) {
      const existing = await execute<any[]>('res.partner', 'search_read', [[['name', '=', name]], ['id']]);
      vendorMap[name.includes('Global') ? 'core' : 'peripherals'] = existing.length > 0 ? existing[0].id : await execute<number>('res.partner', 'create', [{ name, is_company: true, supplier_rank: 1 }]);
    }

    const locationId = (await execute<any[]>('stock.location', 'search_read', [[['usage', '=', 'internal']], ['id']]))[0].id;

    const productsData = [
      { name: 'NVIDIA RTX 4090', price: 1599, cost: 1200, vType: 'core', cat: 'PC Components' },
      { name: 'AMD Ryzen 9 7950X', price: 699, cost: 500, vType: 'core', cat: 'PC Components' },
      { name: 'Corsair 32GB RAM DDR5', price: 120, cost: 80, vType: 'core', cat: 'PC Components' },
      { name: 'Samsung 980 Pro 2TB', price: 180, cost: 130, vType: 'core', cat: 'PC Components' },
      { name: 'ASUS ROG Swift 27"', price: 450, cost: 320, vType: 'core', cat: 'Peripherals & Displays' },
      { name: 'Logitech G Pro X Superlight', price: 150, cost: 100, vType: 'peripherals', cat: 'Peripherals & Displays' },
      { name: 'Razer BlackWidow V4', price: 170, cost: 120, vType: 'peripherals', cat: 'Peripherals & Displays' },
      { name: 'Noctua NH-D15', price: 100, cost: 70, vType: 'peripherals', cat: 'PC Components' },
      { name: 'EVGA SuperNOVA 850W', price: 140, cost: 95, vType: 'peripherals', cat: 'PC Components' },
      { name: 'Fractal Design Meshify 2', price: 160, cost: 110, vType: 'peripherals', cat: 'PC Components' },
    ];

    const productIds: number[] = [];
    for (const p of productsData) {
      const existing = await execute<any[]>('product.product', 'search_read', [[['name', '=', p.name]], ['id']]);
      let pid: number;
      if (existing.length > 0) {
        pid = existing[0].id;
        await execute('product.product', 'write', [[pid], { image_1920: productImages[p.name] || false, categ_id: catMap[p.cat] }]);
      } else {
        pid = await execute<number>('product.product', 'create', [{ name: p.name, type: 'product', list_price: p.price, standard_price: p.cost, categ_id: catMap[p.cat], image_1920: productImages[p.name] || false }]);
      }
      productIds.push(pid);
      
      const sup = await execute<any[]>('product.supplierinfo', 'search_read', [[['product_tmpl_id', '=', pid], ['partner_id', '=', vendorMap[p.vType]]], ['id']]);
      if (sup.length === 0) await execute('product.supplierinfo', 'create', [{ partner_id: vendorMap[p.vType], product_tmpl_id: pid, price: p.cost, min_qty: 1, delay: 1 }]);
    }

    for (const pid of productIds) {
      const quants = await execute<any[]>('stock.quant', 'search_read', [[['product_id', '=', pid], ['location_id', '=', locationId]], ['inventory_quantity']]);
      if (quants.length === 0 || quants[0].inventory_quantity === 0) {
        await execute('stock.quant', 'create', [{ product_id: pid, location_id: locationId, inventory_quantity: 20 }]);
        const newQuants = await execute<any[]>('stock.quant', 'search', [[['product_id', '=', pid], ['location_id', '=', locationId]]]);
        await execute('stock.quant', 'action_apply_inventory', [newQuants]);
      }
      const rules = await execute<any[]>('stock.warehouse.orderpoint', 'search', [[['product_id', '=', pid]]]);
      if (rules.length === 0) await execute('stock.warehouse.orderpoint', 'create', [{ product_id: pid, location_id: locationId, product_min_qty: 5, product_max_qty: 20 }]);
    }
    console.log(`${colors.green}🔢 Base entities and stock verified.${colors.reset}`);

    console.log(`${colors.blue}⏳ Syncing historical data...${colors.reset}`);
    const now = new Date();
    
    for (let i = 1; i <= 3; i++) {
      const ref = `SEED-PO-${i}`;
      const existing = await execute<any[]>('purchase.order', 'search', [[['partner_ref', '=', ref]]]);
      if (existing.length === 0) {
        const date = new Date(now); date.setDate(date.getDate() - (i * 2));
        const poId = await execute<number>('purchase.order', 'create', [{ partner_id: vendorMap['core'], partner_ref: ref, date_order: date.toISOString().split('T')[0] }]);
        await execute('purchase.order.line', 'create', [{ order_id: poId, product_id: productIds[i], product_qty: 10, price_unit: productsData[i].cost }]);
        await execute('purchase.order', 'button_confirm', [[poId]]);
        console.log(`${colors.cyan}📜 Created ${ref}${colors.reset}`);
      }
    }

    for (let i = 1; i <= 5; i++) {
      const ref = `SEED-SO-${i}`;
      const existing = await execute<any[]>('sale.order', 'search', [[['client_order_ref', '=', ref]]]);
      if (existing.length === 0) {
        const date = new Date(now); date.setDate(date.getDate() - i);
        const soId = await execute<number>('sale.order', 'create', [{ partner_id: customerIds[i % customerIds.length], client_order_ref: ref, date_order: date.toISOString().split('T')[0] }]);
        await execute('sale.order.line', 'create', [{ order_id: soId, product_id: productIds[i % 5], product_uom_qty: Math.floor(Math.random() * 3) + 1, price_unit: productsData[i % 5].price }]);
        await execute('sale.order', 'action_confirm', [[soId]]);
        console.log(`${colors.yellow}📜 Created ${ref}${colors.reset}`);
      }
    }

    console.log(`${colors.green}✨ Idempotent Seeding completed successfully!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Error during seeding:${colors.reset}`, error);
    process.exit(1);
  }
}

seed();
