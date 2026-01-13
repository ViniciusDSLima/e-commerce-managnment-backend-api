import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Order, OrderStatus } from '../../../domain/entities/order.entity';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { GetOrderByIdUseCase } from './get-order-by-id.use-case';

@Injectable()
export class CancelOrderUseCase {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
  ) {}

  async execute(id: string, updatedBy?: string): Promise<Order> {
    const order = await this.getOrderByIdUseCase.execute(id);

    if (!order.canBeCancelled()) {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.status === OrderStatus.COMPLETED) {
      for (const item of order.items) {
        await this.productRepository.updateStock(item.productId, item.quantity);
      }
    }

    order.cancel();
    return await this.orderRepository.updateStatus(
      id,
      OrderStatus.CANCELLED,
      updatedBy,
    );
  }
}
