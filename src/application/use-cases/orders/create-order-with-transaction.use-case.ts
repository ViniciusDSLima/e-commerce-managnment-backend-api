import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order, OrderStatus } from '../../../domain/entities/order.entity';
import { OrderItem } from '../../../domain/entities/order-item.entity';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { CreateOrderDto } from './create-order.use-case';
import { ProductTypeOrmEntity } from '../../../infrastructure/persistence/typeorm/entities/product.typeorm.entity';
import { OrderTypeOrmEntity } from '../../../infrastructure/persistence/typeorm/entities/order.typeorm.entity';
import { OrderItemTypeOrmEntity } from '../../../infrastructure/persistence/typeorm/entities/order-item.typeorm.entity';

@Injectable()
export class CreateOrderWithTransactionUseCase {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly dataSource: DataSource,
  ) {}

  async execute(dto: CreateOrderDto, createdBy?: string): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    return await this.dataSource.transaction(async (manager) => {
      const productIds = dto.items.map((item) => item.productId);

      const productEntities = await manager
        .createQueryBuilder(ProductTypeOrmEntity, 'product')
        .setLock('pessimistic_write')
        .where('product.id IN (:...ids)', { ids: productIds })
        .getMany();

      if (productEntities.length !== productIds.length) {
        throw new NotFoundException('One or more products not found');
      }

      const products = productEntities.map((entity) =>
        ProductTypeOrmEntity.toDomain(entity),
      );

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
      const orderEntity = new OrderTypeOrmEntity();
      orderEntity.total = order.total;
      orderEntity.status = OrderStatus.PENDING;
      if (createdBy) {
        orderEntity.createdBy = createdBy;
      }
      orderEntity.items = orderItems.map((item) => {
        const itemEntity = new OrderItemTypeOrmEntity();
        itemEntity.productId = item.productId;
        itemEntity.quantity = item.quantity;
        itemEntity.unitPrice = item.unitPrice;
        itemEntity.subtotal = item.subtotal;
        return itemEntity;
      });

      const savedOrder = await manager.save(OrderTypeOrmEntity, orderEntity);

      for (const item of orderItems) {
        const productEntity = productEntities.find(
          (p) => p.id === item.productId,
        );
        if (!productEntity) {
          continue;
        }
        const newStock = productEntity.stockQuantity - item.quantity;
        if (newStock < 0) {
          throw new BadRequestException(
            `Insufficient stock for product ${productEntity.name}`,
          );
        }
        await manager.update(
          ProductTypeOrmEntity,
          { id: item.productId },
          { stockQuantity: newStock },
        );
      }

      await manager.update(
        OrderTypeOrmEntity,
        { id: savedOrder.id },
        { status: OrderStatus.COMPLETED },
      );

      const completedOrder = await manager
        .createQueryBuilder(OrderTypeOrmEntity, 'order')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .where('order.id = :id', { id: savedOrder.id })
        .getOne();

      if (!completedOrder) {
        throw new Error('Failed to create order');
      }

      return OrderTypeOrmEntity.toDomain(completedOrder);
    });
  }
}
