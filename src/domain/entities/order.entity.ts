import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class Order {
  constructor(
    public readonly id: string | undefined,
    public readonly items: OrderItem[],
    public readonly total: number,
    public status: OrderStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    items: OrderItem[],
    id?: string,
    total?: number,
    status?: OrderStatus,
  ): Order {
    const calculatedTotal =
      total ?? items.reduce((sum, item) => sum + item.subtotal, 0);
    const orderStatus = status ?? OrderStatus.PENDING;
    return new Order(
      id,
      items,
      calculatedTotal,
      orderStatus,
      new Date(),
      new Date(),
    );
  }

  complete(): void {
    if (this.status === OrderStatus.CANCELLED) {
      throw new Error('Cannot complete a cancelled order');
    }
    this.status = OrderStatus.COMPLETED;
  }

  cancel(): void {
    if (this.status === OrderStatus.CANCELLED) {
      throw new Error('Order is already cancelled');
    }
    this.status = OrderStatus.CANCELLED;
  }

  canBeCancelled(): boolean {
    return this.status !== OrderStatus.CANCELLED;
  }
}
