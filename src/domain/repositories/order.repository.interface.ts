import { Order } from '../entities/order.entity';
import {
  PaginationOptions,
  PaginationResult,
} from './product.repository.interface';

export interface IOrderRepository {
  create(order: Order, createdBy?: string): Promise<Order>;
  findAll(options?: PaginationOptions): Promise<PaginationResult<Order>>;
  findById(id: string): Promise<Order | null>;
  updateStatus(
    id: string,
    status: Order['status'],
    updatedBy?: string,
  ): Promise<Order>;
}
