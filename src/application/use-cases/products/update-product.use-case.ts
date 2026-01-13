import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { GetProductByIdUseCase } from './get-product-by-id.use-case';

export interface UpdateProductDto {
  name?: string;
  category?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  async execute(
    id: string,
    dto: UpdateProductDto,
    updatedBy?: string,
  ): Promise<Product> {
    await this.getProductByIdUseCase.execute(id);

    if (dto.price !== undefined && dto.price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    if (dto.stockQuantity !== undefined && dto.stockQuantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    const updateData: {
      name?: string;
      category?: string;
      description?: string;
      price?: number;
      stockQuantity?: number;
    } = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.stockQuantity !== undefined)
      updateData.stockQuantity = dto.stockQuantity;

    return await this.productRepository.update(
      id,
      updateData as any,
      updatedBy,
    );
  }
}
