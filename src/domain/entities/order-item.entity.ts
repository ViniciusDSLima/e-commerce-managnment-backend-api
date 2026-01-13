import { v4 as uuidv4 } from 'uuid';
import { Product } from './product.entity';

export class OrderItem {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
    public readonly subtotal: number,
    public product?: Product,
  ) {}

  static create(
    productId: string,
    quantity: number,
    unitPrice: number,
  ): OrderItem {
    const subtotal = unitPrice * quantity;
    const id = uuidv4();
    return new OrderItem(id, productId, quantity, unitPrice, subtotal);
  }
}
