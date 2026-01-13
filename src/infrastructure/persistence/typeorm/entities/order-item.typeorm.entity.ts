import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrderTypeOrmEntity } from './order.typeorm.entity';
import { ProductTypeOrmEntity } from './product.typeorm.entity';
import { OrderItem } from '../../../../domain/entities/order-item.entity';

@Entity('order_items')
@Index('IDX_ORDER_ITEMS_ORDER_ID', ['order'])
@Index('IDX_ORDER_ITEMS_PRODUCT_ID', ['productId'])
export class OrderItemTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrderTypeOrmEntity, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: OrderTypeOrmEntity;

  @ManyToOne(() => ProductTypeOrmEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductTypeOrmEntity;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  static toDomain(entity: OrderItemTypeOrmEntity): OrderItem {
    const orderItem = new OrderItem(
      entity.id,
      entity.productId,
      entity.quantity,
      Number(entity.unitPrice),
      Number(entity.subtotal),
    );
    if (!entity.product) {
      return orderItem;
    }
    orderItem.product = ProductTypeOrmEntity.toDomain(entity.product);
    return orderItem;
  }
}
