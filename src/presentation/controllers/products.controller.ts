import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateProductUseCase } from '../../application/use-cases/products/create-product.use-case';
import { GetAllProductsUseCase } from '../../application/use-cases/products/get-all-products.use-case';
import { GetProductByIdUseCase } from '../../application/use-cases/products/get-product-by-id.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/products/update-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/products/delete-product.use-case';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(AuditInterceptor)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    const createdBy = req.audit?.user;
    return await this.createProductUseCase.execute(createProductDto, createdBy);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('products')
  @CacheTTL(300)
  @ApiOperation({ summary: 'List all products with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of products' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.getAllProductsUseCase.execute({
      page: paginationDto.page,
      limit: paginationDto.limit,
    });
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('product')
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.getProductByIdUseCase.execute(id);
  }

  @Patch(':id')
  @UseInterceptors(AuditInterceptor)
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: any,
  ) {
    const updatedBy = req.audit?.user;
    return await this.updateProductUseCase.execute(
      id,
      updateProductDto,
      updatedBy,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteProductUseCase.execute(id);
  }
}
