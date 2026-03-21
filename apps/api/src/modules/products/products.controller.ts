import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
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
import { ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger'
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
import { Auth } from '@/shared/decorators/auth.decorator'
import { TenantCtx } from '@/shared/decorators/tenant-context.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { ProductsService } from './products.service'
import {
  BulkPriceUpdateDto,
  CreateProductDto,
  ExecuteImportDto,
  InventoryAdjustmentDto,
  ProductQueryDto,
  UpdateProductDto,
} from './dto/product.dto'

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'List products with pagination, search and filters' })
  findAll(
    @TenantCtx() ctx: TenantContext,
    @Query() query: ProductQueryDto,
  ): Promise<PaginatedProducts> {
    return this.productsService.findAll(ctx.schemaName, query)
  }

  @Post()
  @Auth(UserRole.SALES_REP)
  @ApiOperation({ summary: 'Create a product or service' })
  create(
    @Body() dto: CreateProductDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Product> {
    return this.productsService.create(ctx.schemaName, dto, user.id)
  }

  @Get('low-stock')
  @Auth(UserRole.VIEWER)
  @ApiOperation({ summary: 'Get products with stock at or below minimum threshold' })
  getLowStock(@TenantCtx() ctx: TenantContext): Promise<LowStockItem[]> {
    return this.productsService.getLowStock(ctx.schemaName)
  }

  @Get('export')
  @Auth(UserRole.VIEWER)
  @Header('Content-Type', 'text/csv')
  @ApiOperation({ summary: 'Export all active products as CSV' })
  async exportCsv(@TenantCtx() ctx: TenantContext, @Res() res: Response): Promise<void> {
    const buffer = await this.productsService.exportCsv(ctx.schemaName)
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"')
    res.send(buffer)
  }

  @Get(':id')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiOperation({ summary: 'Get product by ID with full details' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Product> {
    return this.productsService.findOne(ctx.schemaName, id)
  }

  @Get(':id/movements')
  @Auth(UserRole.VIEWER)
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiOperation({ summary: 'Get product with recent inventory movements' })
  findOneWithMovements(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
  ): Promise<ProductWithMovements> {
    return this.productsService.findOneWithMovements(ctx.schemaName, id)
  }

  @Patch(':id')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiOperation({ summary: 'Update a product' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<Product> {
    return this.productsService.update(ctx.schemaName, id, dto)
  }

  @Delete(':id')
  @Auth(UserRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiOperation({ summary: 'Soft-delete a product' })
  remove(@Param('id', ParseUUIDPipe) id: string, @TenantCtx() ctx: TenantContext): Promise<void> {
    return this.productsService.remove(ctx.schemaName, id)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  Inventory
  // ═══════════════════════════════════════════════════════════════════════════

  @Post(':id/inventory')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiOperation({ summary: 'Adjust inventory (purchase, sale, adjustment, return, transfer)' })
  adjustInventory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: InventoryAdjustmentDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InventoryMovement> {
    return this.productsService.adjustInventory(ctx.schemaName, id, dto, user.id)
  }

  @Post('import/analyze')
  @Auth(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Step 1: Upload CSV, analyze columns, suggest mappings, preview' })
  analyzeImport(@UploadedFile() file: Express.Multer.File): Promise<AnalyzeResult> {
    return this.productsService.analyzeImport(file)
  }

  @Post('import/execute')
  @Auth(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Step 2: Execute import with confirmed mappings and duplicate strategy',
  })
  executeImport(
    @Body() dto: ExecuteImportDto,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ImportResult> {
    const mapping = dto.mapping ?? {}
    const strategy = (dto.duplicateStrategy ?? 'skip') as DuplicateStrategy
    return this.productsService.executeImport(
      ctx.schemaName,
      dto.fileId,
      mapping,
      strategy,
      user.id,
    )
  }

  @Post(':id/duplicate')
  @Auth(UserRole.SALES_REP)
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiOperation({ summary: 'Duplicate a product (creates a copy with "(copy)" suffix)' })
  duplicate(
    @Param('id', ParseUUIDPipe) id: string,
    @TenantCtx() ctx: TenantContext,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Product> {
    return this.productsService.duplicate(ctx.schemaName, id, user.id)
  }

  @Patch('bulk/price')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk update prices by percentage for a category and/or brand' })
  bulkPriceUpdate(
    @Body() dto: BulkPriceUpdateDto,
    @TenantCtx() ctx: TenantContext,
  ): Promise<{ updated: number }> {
    return this.productsService.bulkPriceUpdate(ctx.schemaName, dto)
  }
}
