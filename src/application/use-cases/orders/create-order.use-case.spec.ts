import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderUseCase } from './create-order.use-case';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { Order, OrderStatus } from '../../../domain/entities/order.entity';
import { Product } from '../../../domain/entities/product.entity';
import { TEST_UUIDS } from '../__tests__/test-helpers';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;
  let productRepository: jest.Mocked<IProductRepository>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderUseCase,
        {
          provide: 'IOrderRepository',
          useValue: mockOrderRepository,
        },
        {
          provide: 'IProductRepository',
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
    orderRepository = module.get('IOrderRepository');
    productRepository = module.get('IProductRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create an order successfully', async () => {
    const product = new Product(
      TEST_UUIDS.PRODUCT_1,
      'Product',
      'Category',
      'Description',
      100,
      10,
      new Date(),
      new Date(),
    );

    const orderItems = [
      {
        productId: TEST_UUIDS.PRODUCT_1,
        quantity: 2,
        unitPrice: 100,
        subtotal: 200,
        id: TEST_UUIDS.ORDER_ITEM_1,
      },
    ];
    const createdOrder = Order.createWithId(
      TEST_UUIDS.ORDER_1,
      orderItems as any,
      200,
      OrderStatus.PENDING,
    );
    const completedOrder = Order.createWithId(
      TEST_UUIDS.ORDER_1,
      orderItems as any,
      200,
      OrderStatus.COMPLETED,
    );

    productRepository.findByIds.mockResolvedValue([product]);
    orderRepository.create.mockResolvedValue(createdOrder);
    orderRepository.updateStatus.mockResolvedValue(completedOrder);
    productRepository.updateStock.mockResolvedValue(undefined);

    const dto = {
      items: [{ productId: TEST_UUIDS.PRODUCT_1, quantity: 2 }],
    };

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(productRepository.findByIds).toHaveBeenCalledWith([
      TEST_UUIDS.PRODUCT_1,
    ]);
    expect(orderRepository.create).toHaveBeenCalled();
    expect(productRepository.updateStock).toHaveBeenCalledWith(
      TEST_UUIDS.PRODUCT_1,
      -2,
    );
    expect(orderRepository.updateStatus).toHaveBeenCalledWith(
      TEST_UUIDS.ORDER_1,
      OrderStatus.COMPLETED,
    );
  });

  it('should throw BadRequestException when items array is empty', async () => {
    const dto = { items: [] };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(productRepository.findByIds).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when product not found in repository', async () => {
    productRepository.findByIds.mockResolvedValue([]);

    const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';
    const dto = {
      items: [{ productId: nonExistentId, quantity: 1 }],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    expect(productRepository.findByIds).toHaveBeenCalledWith([nonExistentId]);
  });

  it('should throw NotFoundException when product not found in loop', async () => {
    const product1 = new Product(
      TEST_UUIDS.PRODUCT_1,
      'Product1',
      'Category',
      'Description',
      100,
      10,
      new Date(),
      new Date(),
    );
    const product2 = new Product(
      TEST_UUIDS.PRODUCT_2,
      'Product2',
      'Category',
      'Description',
      200,
      5,
      new Date(),
      new Date(),
    );

    productRepository.findByIds.mockResolvedValue([product1, product2]);

    const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';
    const dto = {
      items: [
        { productId: TEST_UUIDS.PRODUCT_1, quantity: 1 },
        { productId: nonExistentId, quantity: 1 },
      ],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when stock is insufficient', async () => {
    const product = new Product(
      TEST_UUIDS.PRODUCT_1,
      'Product',
      'Category',
      'Description',
      100,
      5,
      new Date(),
      new Date(),
    );

    productRepository.findByIds.mockResolvedValue([product]);

    const dto = {
      items: [{ productId: TEST_UUIDS.PRODUCT_1, quantity: 10 }],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });
});
