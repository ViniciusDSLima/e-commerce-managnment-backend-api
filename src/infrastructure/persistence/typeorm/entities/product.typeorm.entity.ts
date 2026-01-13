import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Product } from '../../../../domain/entities/product.entity';

@Entity('products')
@Index('IDX_PRODUCTS_CATEGORY', ['category'])
@Index('IDX_PRODUCTS_NAME', ['name'])
@Index('IDX_PRODUCTS_CREATED_AT', ['createdAt'])
export class ProductTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: ProductTypeOrmEntity): Product {
    return new Product(
      entity.id,
      entity.name,
      entity.category,
      entity.description,
      Number(entity.price),
      entity.stockQuantity,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(product: Product): ProductTypeOrmEntity {
    const entity = new ProductTypeOrmEntity();
    if (product.id) {
      entity.id = product.id;
    }
    entity.name = product.name;
    entity.category = product.category;
    entity.description = product.description;
    entity.price = product.price;
    entity.stockQuantity = product.stockQuantity;
    return entity;
  }
}
