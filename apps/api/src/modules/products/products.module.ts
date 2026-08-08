import { Module } from '@nestjs/common'
import { ProductsController } from './controllers/products.controller'
import { ProductsService } from './services/products.service'
import { ProductInventoryService } from './services/product-inventory.service'
import { ProductImportExportService } from './services/product-import-export.service'
import { ProductsRepository } from './repositories/products.repository'

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsRepository,
    ProductsService,
    ProductInventoryService,
    ProductImportExportService,
  ],
  exports: [ProductsService, ProductInventoryService, ProductImportExportService],
})
export class ProductsModule {}
