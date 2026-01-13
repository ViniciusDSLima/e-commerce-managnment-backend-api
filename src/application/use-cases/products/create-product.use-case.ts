import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Product } from '../../../domain/entities/product.entity';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';

export interface CreateProductDto {
  name: string;
  category: string;
  description?: string;
  price: number;
  stockQuantity: number;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(dto: CreateProductDto, createdBy?: string): Promise<Product> {
    if (dto.price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    if (dto.stockQuantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    const product = new Product(
      undefined,
      dto.name,
      dto.category,
      dto.description || '',
      dto.price,
      dto.stockQuantity,
      new Date(),
      new Date(),
    );

    return await this.productRepository.create(product, createdBy);
  }
}
