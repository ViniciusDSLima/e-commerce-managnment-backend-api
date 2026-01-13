import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../../domain/entities/order.entity';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import {
  PaginationOptions,
  PaginationResult,
} from '../../../domain/repositories/product.repository.interface';
import { OrderTypeOrmEntity } from '../typeorm/entities/order.typeorm.entity';
import { OrderItemTypeOrmEntity } from '../typeorm/entities/order-item.typeorm.entity';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderTypeOrmEntity)
    private readonly repository: Repository<OrderTypeOrmEntity>,
  ) {}

  async create(order: Order, createdBy?: string): Promise<Order> {
    const entity = new OrderTypeOrmEntity();
    entity.total = order.total;
    entity.status = order.status;
    if (createdBy) {
      entity.createdBy = createdBy;
    }
    entity.items = order.items.map((item) => {
      const itemEntity = new OrderItemTypeOrmEntity();
      itemEntity.productId = item.productId;
      itemEntity.quantity = item.quantity;
      itemEntity.unitPrice = item.unitPrice;
      itemEntity.subtotal = item.subtotal;
      return itemEntity;
    });

    const saved = await this.repository.save(entity);
    const loaded = await this.repository.findOne({
      where: { id: saved.id },
      relations: ['items', 'items.product'],
    });

    if (!loaded) {
      throw new Error('Failed to create order');
    }

    return OrderTypeOrmEntity.toDomain(loaded);
  }

  async findAll(options?: PaginationOptions): Promise<PaginationResult<Order>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [entities, total] = await this.repository.findAndCount({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: entities.map((entity) => OrderTypeOrmEntity.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Order | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
    return entity ? OrderTypeOrmEntity.toDomain(entity) : null;
  }

  async updateStatus(
    id: string,
    status: Order['status'],
    updatedBy?: string,
  ): Promise<Order> {
    const updateData: any = { status };
    if (updatedBy) {
      updateData.updatedBy = updatedBy;
    }
    await this.repository.update(id, updateData);
    const updated = await this.repository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
    if (!updated) {
      throw new Error(`Order with ID ${id} not found`);
    }
    return OrderTypeOrmEntity.toDomain(updated);
  }
}
