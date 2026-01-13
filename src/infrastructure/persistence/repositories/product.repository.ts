import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../../../domain/entities/product.entity';
import {
  IProductRepository,
  PaginationOptions,
  PaginationResult,
} from '../../../domain/repositories/product.repository.interface';
import { ProductTypeOrmEntity } from '../typeorm/entities/product.typeorm.entity';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductTypeOrmEntity)
    private readonly repository: Repository<ProductTypeOrmEntity>,
  ) {}

  async create(product: Product, createdBy?: string): Promise<Product> {
    const entity = ProductTypeOrmEntity.toPersistence(product);
    if (createdBy) {
      entity.createdBy = createdBy;
    }
    const saved = await this.repository.save(entity);
    return ProductTypeOrmEntity.toDomain(saved);
  }

  async findAll(
    options?: PaginationOptions,
  ): Promise<PaginationResult<Product>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    const [entities, total] = await this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: entities.map((entity) => ProductTypeOrmEntity.toDomain(entity)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      return null;
    }
    return ProductTypeOrmEntity.toDomain(entity);
  }

  async findByIdWithLock(id: string): Promise<Product | null> {
    const entity = await this.repository
      .createQueryBuilder('product')
      .setLock('pessimistic_write')
      .where('product.id = :id', { id })
      .getOne();
    if (!entity) {
      return null;
    }
    return ProductTypeOrmEntity.toDomain(entity);
  }

  async update(
    id: string,
    product: Partial<Product>,
    updatedBy?: string,
  ): Promise<Product> {
    const updateData: any = { ...product };
    if (updatedBy) {
      updateData.updatedBy = updatedBy;
    }
    await this.repository.update(id, updateData);
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return ProductTypeOrmEntity.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) {
      return [];
    }
    const entities = await this.repository.findBy({ id: In(ids) });
    return entities.map((entity) => ProductTypeOrmEntity.toDomain(entity));
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    const product = await this.repository
      .createQueryBuilder('product')
      .setLock('pessimistic_write')
      .where('product.id = :id', { id })
      .getOne();

    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }

    const newStock = product.stockQuantity + quantity;
    if (newStock < 0) {
      throw new Error(
        `Insufficient stock. Available: ${product.stockQuantity}, Requested: ${-quantity}`,
      );
    }

    await this.repository.update(id, { stockQuantity: newStock });
  }
}
