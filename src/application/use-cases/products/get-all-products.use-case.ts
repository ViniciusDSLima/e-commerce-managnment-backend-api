import { Injectable, Inject } from '@nestjs/common';
import {
  IProductRepository,
  PaginationOptions,
  PaginationResult,
} from '../../../domain/repositories/product.repository.interface';
import { Product } from '../../../domain/entities/product.entity';

@Injectable()
export class GetAllProductsUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    options?: PaginationOptions,
  ): Promise<PaginationResult<Product>> {
    return await this.productRepository.findAll(options);
  }
}
