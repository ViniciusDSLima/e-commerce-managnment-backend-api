import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { GetProductByIdUseCase } from './get-product-by-id.use-case';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    await this.getProductByIdUseCase.execute(id);
    await this.productRepository.delete(id);
  }
}
