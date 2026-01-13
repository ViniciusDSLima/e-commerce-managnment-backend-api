import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly items: OrderItem[],
    public readonly total: number,
    public status: OrderStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(items: OrderItem[]): Order {
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    return new Order(
      '',
      items,
      total,
      OrderStatus.PENDING,
      new Date(),
      new Date(),
    );
  }

  static createWithId(
    id: string,
    items: OrderItem[],
    total: number,
    status: OrderStatus,
  ): Order {
    return new Order(id, items, total, status, new Date(), new Date());
  }

  complete(): void {
    if (this.status === OrderStatus.CANCELLED) {
      throw new Error('Cannot complete a cancelled order');
    }
    this.status = OrderStatus.COMPLETED;
  }

  cancel(): void {
    if (this.status === OrderStatus.COMPLETED) {
      this.status = OrderStatus.CANCELLED;
    } else if (this.status === OrderStatus.PENDING) {
      this.status = OrderStatus.CANCELLED;
    } else {
      throw new Error('Order is already cancelled');
    }
  }

  canBeCancelled(): boolean {
    return this.status !== OrderStatus.CANCELLED;
  }
}
