import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { Order, OrderStatus } from '../../../domain/entities/order.entity';
import { OrderItem } from '../../../domain/entities/order-item.entity';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  items: CreateOrderItemDto[];
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(dto: CreateOrderDto): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    const productIds = dto.items.map((item) => item.productId);
    const products = await this.productRepository.findByIds(productIds);

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found');
    }

    const orderItems: OrderItem[] = [];

    for (const itemDto of dto.items) {
      const product = products.find((p) => p.id === itemDto.productId);

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${itemDto.productId} not found`,
        );
      }

      if (!product.hasStock(itemDto.quantity)) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, Requested: ${itemDto.quantity}`,
        );
      }

      const orderItem = OrderItem.create(
        itemDto.productId,
        itemDto.quantity,
        product.price,
      );
      orderItems.push(orderItem);
    }

    const order = Order.create(orderItems);
    const createdOrder = await this.orderRepository.create(order);

    for (const item of createdOrder.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        continue;
      }
      product.decreaseStock(item.quantity);
      await this.productRepository.updateStock(item.productId, -item.quantity);
    }

    createdOrder.complete();
    return await this.orderRepository.updateStatus(
      createdOrder.id,
      OrderStatus.COMPLETED,
    );
  }
}
