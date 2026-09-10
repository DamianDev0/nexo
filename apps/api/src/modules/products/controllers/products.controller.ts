import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { UserRole } from '@repo/shared-types'
import type {
  AnalyzeResult,
  AuthenticatedUser,
  DuplicateStrategy,
  ImportResult,
  InventoryMovement,
  LowStockItem,
  PaginatedProducts,
  Product,
  ProductWithMovements,
  TenantContext,
} from '@repo/shared-types'
import { ApiEndpoint } from '@/shared/decorators/api-endpoint.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { ProductsService } from '../services/products.service'
import { ProductInventoryService } from '../services/product-inventory.service'
import { ProductImportExportService } from '../services/product-import-export.service'
import {
  BulkPriceUpdateDto,
  CreateProductDto,
  ExecuteImportDto,
  InventoryAdjustmentDto,
  ProductQueryDto,
  UpdateProductDto,
} from '../dto/product.dto'

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly inventoryService: ProductInventoryService,
    private readonly importExportService: ProductImportExportService,
  ) {}

  @Get()
  @ApiEndpoint({
    summary: 'List products with pagination, search and filters',
    roles: [UserRole.VIEWER],
  })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @Query() query: ProductQueryDto,
  ): Promise<PaginatedProducts> {
    return this.productsService.findAll(ctx.schemaName, query)
  }

  @Post()
  @ApiEndpoint({ summary: 'Create a product or service', roles: [UserRole.SALES_REP] })
  create(
    @Body() dto: CreateProductDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Product> {
    return this.productsService.create(ctx.schemaName, dto, user.id)
  }

  @Get('low-stock')
  @ApiEndpoint({
    summary: 'Get products with stock at or below minimum threshold',
    roles: [UserRole.VIEWER],
  })
  getLowStock(@TenantCtx() ctx: TenantContext): Promise<LowStockItem[]> {
    return this.inventoryService.getLowStock(ctx.schemaName)
  }

  @Get('export')
  @ApiEndpoint({ summary: 'Export all active products as CSV', roles: [UserRole.VIEWER] })
  @Header('Content-Type', 'text/csv')
  async exportCsv(@TenantCtx() ctx: TenantContext, @Res() res: Response): Promise<void> {
    const buffer = await this.importExportService.exportCsv(ctx.schemaName)
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"')
    res.send(buffer)
  }

  @Get(':id')
  @ApiEndpoint({
    summary: 'Get product by ID with full details',
    roles: [UserRole.VIEWER],
    param: 'Product UUID',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Product> {
    return this.productsService.findOne(ctx.schemaName, id)
  }

  @Get(':id/movements')
  @ApiEndpoint({
    summary: 'Get product with recent inventory movements',
    roles: [UserRole.VIEWER],
    param: 'Product UUID',
  })
  findOneWithMovements(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ProductWithMovements> {
    return this.productsService.findOneWithMovements(ctx.schemaName, id)
  }

  @Patch(':id')
  @ApiEndpoint({ summary: 'Update a product', roles: [UserRole.SALES_REP], param: 'Product UUID' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Product> {
    return this.productsService.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @ApiEndpoint({
    summary: 'Soft-delete a product',
    roles: [UserRole.MANAGER],
    param: 'Product UUID',
    status: HttpStatus.NO_CONTENT,
  })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.productsService.remove(ctx.schemaName, id)
  }

  @Post(':id/inventory')
  @ApiEndpoint({
    summary: 'Adjust inventory (purchase, sale, adjustment, return, transfer)',
    roles: [UserRole.SALES_REP],
    param: 'Product UUID',
  })
  adjustInventory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: InventoryAdjustmentDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InventoryMovement> {
    return this.inventoryService.adjustInventory(ctx.schemaName, id, dto, user.id)
  }

  @Post('import/analyze')
  @ApiEndpoint({
    summary: 'Step 1: Upload CSV, analyze columns, suggest mappings, preview',
    roles: [UserRole.ADMIN],
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  analyzeImport(
    @UploadedFile() file: Express.Multer.File,
    @TenantCtx() ctx: TenantContext,
  ): Promise<AnalyzeResult> {
    return this.importExportService.analyzeImport(ctx.schemaName, file)
  }

  @Post('import/execute')
  @ApiEndpoint({
    summary: 'Step 2: Execute import with confirmed mappings and duplicate strategy',
    roles: [UserRole.ADMIN],
  })
  executeImport(
    @Body() dto: ExecuteImportDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ImportResult> {
    const mapping = dto.mapping ?? {}
    const strategy = (dto.duplicateStrategy ?? 'skip') as DuplicateStrategy
    return this.importExportService.executeImport(
      ctx.schemaName,
      dto.fileId,
      mapping,
      strategy,
      user.id,
    )
  }

  @Post(':id/duplicate')
  @ApiEndpoint({
    summary: 'Duplicate a product (creates a copy with "(copy)" suffix)',
    roles: [UserRole.SALES_REP],
    param: 'Product UUID',
  })
  duplicate(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Product> {
    return this.productsService.duplicate(ctx.schemaName, id, user.id)
  }

  @Patch('bulk/price')
  @ApiEndpoint({
    summary: 'Bulk update prices by percentage for a category and/or brand',
    roles: [UserRole.ADMIN],
  })
  bulkPriceUpdate(
    @Body() dto: BulkPriceUpdateDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<{ updated: number }> {
    return this.productsService.bulkPriceUpdate(ctx.schemaName, dto)
  }
}
