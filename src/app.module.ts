import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { CacheModule } from '@nestjs/cache-manager';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ProductTypeOrmEntity } from './infrastructure/persistence/typeorm/entities/product.typeorm.entity';
import { OrderTypeOrmEntity } from './infrastructure/persistence/typeorm/entities/order.typeorm.entity';
import { OrderItemTypeOrmEntity } from './infrastructure/persistence/typeorm/entities/order-item.typeorm.entity';
import { HealthController } from './presentation/controllers/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 300,
      max: 100,
    }),
    TerminusModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'ecommerce_db',
      entities: [
        ProductTypeOrmEntity,
        OrderTypeOrmEntity,
        OrderItemTypeOrmEntity,
      ],
      migrations: ['dist/infrastructure/persistence/typeorm/migrations/*.js'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      namingStrategy: new SnakeNamingStrategy(),
    }),
    ProductsModule,
    OrdersModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
