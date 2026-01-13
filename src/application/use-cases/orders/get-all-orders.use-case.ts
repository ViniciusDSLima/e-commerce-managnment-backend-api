import { Injectable, Inject } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import {
  PaginationOptions,
  PaginationResult,
} from '../../../domain/repositories/product.repository.interface';
import { Order } from '../../../domain/entities/order.entity';

@Injectable()
export class GetAllOrdersUseCase {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(options?: PaginationOptions): Promise<PaginationResult<Order>> {
    return await this.orderRepository.findAll(options);
  }
}
