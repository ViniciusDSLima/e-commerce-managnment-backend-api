import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from '../presentation/controllers/products.controller';
import { ProductRepository } from '../infrastructure/persistence/repositories/product.repository';
import { ProductTypeOrmEntity } from '../infrastructure/persistence/typeorm/entities/product.typeorm.entity';
import { CreateProductUseCase } from '../application/use-cases/products/create-product.use-case';
import { GetAllProductsUseCase } from '../application/use-cases/products/get-all-products.use-case';
import { GetProductByIdUseCase } from '../application/use-cases/products/get-product-by-id.use-case';
import { UpdateProductUseCase } from '../application/use-cases/products/update-product.use-case';
import { DeleteProductUseCase } from '../application/use-cases/products/delete-product.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([ProductTypeOrmEntity])],
  controllers: [ProductsController],
  providers: [
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
    CreateProductUseCase,
    GetAllProductsUseCase,
    GetProductByIdUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
  ],
  exports: ['IProductRepository'],
})
export class ProductsModule {}
