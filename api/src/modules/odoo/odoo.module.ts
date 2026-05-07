import { Module } from '@nestjs/common';
import { OdooConnectionService } from './odoo-connection.service';
import { OdooInventoryRepository } from './repositories/odoo-inventory.repository';
import { OdooPurchaseRepository } from './repositories/odoo-purchase.repository';

@Module({
  providers: [
    OdooConnectionService,
    OdooInventoryRepository,
    OdooPurchaseRepository,
  ],
  exports: [
    OdooConnectionService,
    OdooInventoryRepository,
    OdooPurchaseRepository,
  ],
})
export class OdooModule {}
