import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CancelOrderUseCase } from './cancel-order.use-case';
import { GetOrderByIdUseCase } from './get-order-by-id.use-case';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { Order, OrderStatus } from '../../../domain/entities/order.entity';
import { OrderItem } from '../../../domain/entities/order-item.entity';
import { TEST_UUIDS } from '../__tests__/test-helpers';

describe('CancelOrderUseCase', () => {
  let useCase: CancelOrderUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let getOrderByIdUseCase: jest.Mocked<GetOrderByIdUseCase>;

  const mockOrderRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockProductRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByIds: jest.fn(),
    updateStock: jest.fn(),
  };

  const mockGetOrderByIdUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelOrderUseCase,
        {
          provide: 'IOrderRepository',
          useValue: mockOrderRepository,
        },
        {
          provide: 'IProductRepository',
          useValue: mockProductRepository,
        },
        {
          provide: GetOrderByIdUseCase,
          useValue: mockGetOrderByIdUseCase,
        },
      ],
    }).compile();

    useCase = module.get<CancelOrderUseCase>(CancelOrderUseCase);
    orderRepository = module.get('IOrderRepository');
    productRepository = module.get('IProductRepository');
    getOrderByIdUseCase = module.get(GetOrderByIdUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should cancel a pending order successfully', async () => {
    const items = [OrderItem.create(TEST_UUIDS.PRODUCT_1, 2, 100)];
    const order = Order.create(
      items,
      TEST_UUIDS.ORDER_1,
      200,
      OrderStatus.PENDING,
    );

    const cancelledOrder = Order.create(
      items,
      TEST_UUIDS.ORDER_1,
      200,
      OrderStatus.CANCELLED,
    );

    getOrderByIdUseCase.execute.mockResolvedValue(order);
    orderRepository.updateStatus.mockResolvedValue(cancelledOrder);

    const result = await useCase.execute(TEST_UUIDS.ORDER_1);

    expect(result).toBeDefined();
    expect(getOrderByIdUseCase.execute).toHaveBeenCalledWith(
      TEST_UUIDS.ORDER_1,
    );
    expect(orderRepository.updateStatus).toHaveBeenCalledWith(
      TEST_UUIDS.ORDER_1,
      OrderStatus.CANCELLED,
      undefined,
    );
    expect(productRepository.updateStock).not.toHaveBeenCalled();
  });

  it('should cancel a completed order and restore stock', async () => {
    const items = [OrderItem.create(TEST_UUIDS.PRODUCT_1, 2, 100)];
    const order = Order.create(
      items,
      TEST_UUIDS.ORDER_1,
      200,
      OrderStatus.COMPLETED,
    );

    const cancelledOrder = Order.create(
      items,
      TEST_UUIDS.ORDER_1,
      200,
      OrderStatus.CANCELLED,
    );

    getOrderByIdUseCase.execute.mockResolvedValue(order);
    orderRepository.updateStatus.mockResolvedValue(cancelledOrder);
    productRepository.updateStock.mockResolvedValue(undefined);

    const result = await useCase.execute(TEST_UUIDS.ORDER_1);

    expect(result).toBeDefined();
    expect(getOrderByIdUseCase.execute).toHaveBeenCalledWith(
      TEST_UUIDS.ORDER_1,
    );
    expect(productRepository.updateStock).toHaveBeenCalledWith(
      TEST_UUIDS.PRODUCT_1,
      2,
    );
    expect(orderRepository.updateStatus).toHaveBeenCalledWith(
      TEST_UUIDS.ORDER_1,
      OrderStatus.CANCELLED,
      undefined,
    );
  });

  it('should throw BadRequestException when order is already cancelled', async () => {
    const items = [OrderItem.create(TEST_UUIDS.PRODUCT_1, 2, 100)];
    const order = Order.create(
      items,
      TEST_UUIDS.ORDER_1,
      200,
      OrderStatus.CANCELLED,
    );

    getOrderByIdUseCase.execute.mockResolvedValue(order);

    await expect(useCase.execute(TEST_UUIDS.ORDER_1)).rejects.toThrow(
      BadRequestException,
    );
    expect(orderRepository.updateStatus).not.toHaveBeenCalled();
  });
});
