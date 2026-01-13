import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Order, OrderStatus } from '../../../../domain/entities/order.entity';
import { OrderItemTypeOrmEntity } from './order-item.typeorm.entity';

@Entity('orders')
@Index('IDX_ORDERS_STATUS', ['status'])
@Index('IDX_ORDERS_CREATED_AT', ['createdAt'])
export class OrderTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => OrderItemTypeOrmEntity, (item) => item.order, {
    cascade: true,
  })
  items: OrderItemTypeOrmEntity[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: OrderTypeOrmEntity): Order {
    const items = entity.items
      ? entity.items.map((item) => OrderItemTypeOrmEntity.toDomain(item))
      : [];
    return Order.create(items, entity.id, Number(entity.total), entity.status);
  }
}
