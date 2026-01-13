import { Product } from '../entities/product.entity';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductRepository {
  create(product: Product, createdBy?: string): Promise<Product>;
  findAll(options?: PaginationOptions): Promise<PaginationResult<Product>>;
  findById(id: string): Promise<Product | null>;
  findByIdWithLock(id: string): Promise<Product | null>;
  update(
    id: string,
    product: Partial<Product>,
    updatedBy?: string,
  ): Promise<Product>;
  delete(id: string): Promise<void>;
  findByIds(ids: string[]): Promise<Product[]>;
  updateStock(id: string, quantity: number): Promise<void>;
}
