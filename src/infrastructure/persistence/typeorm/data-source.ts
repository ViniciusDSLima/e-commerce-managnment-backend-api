import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ProductTypeOrmEntity } from './entities/product.typeorm.entity';
import { OrderTypeOrmEntity } from './entities/order.typeorm.entity';
import { OrderItemTypeOrmEntity } from './entities/order-item.typeorm.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ecommerce_db',
  entities: [ProductTypeOrmEntity, OrderTypeOrmEntity, OrderItemTypeOrmEntity],
  migrations: ['src/infrastructure/persistence/typeorm/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  namingStrategy: new SnakeNamingStrategy(),
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
