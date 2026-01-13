import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from '../presentation/controllers/orders.controller';
import { OrderRepository } from '../infrastructure/persistence/repositories/order.repository';
import { OrderTypeOrmEntity } from '../infrastructure/persistence/typeorm/entities/order.typeorm.entity';
import { OrderItemTypeOrmEntity } from '../infrastructure/persistence/typeorm/entities/order-item.typeorm.entity';
import { CreateOrderUseCase } from '../application/use-cases/orders/create-order.use-case';
import { CreateOrderWithTransactionUseCase } from '../application/use-cases/orders/create-order-with-transaction.use-case';
import { GetAllOrdersUseCase } from '../application/use-cases/orders/get-all-orders.use-case';
import { GetOrderByIdUseCase } from '../application/use-cases/orders/get-order-by-id.use-case';
import { CancelOrderUseCase } from '../application/use-cases/orders/cancel-order.use-case';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderTypeOrmEntity, OrderItemTypeOrmEntity]),
    ProductsModule,
  ],
  controllers: [OrdersController],
  providers: [
    {
      provide: 'IOrderRepository',
      useClass: OrderRepository,
    },
    GetAllOrdersUseCase,
    GetOrderByIdUseCase,
    CreateOrderUseCase,
    CreateOrderWithTransactionUseCase,
    CancelOrderUseCase,
  ],
})
export class OrdersModule {}
