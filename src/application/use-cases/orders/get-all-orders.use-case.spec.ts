import { Test, TestingModule } from '@nestjs/testing';
import { GetAllOrdersUseCase } from './get-all-orders.use-case';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { Order, OrderStatus } from '../../../domain/entities/order.entity';
import { TEST_UUIDS } from '../__tests__/test-helpers';

describe('GetAllOrdersUseCase', () => {
  let useCase: GetAllOrdersUseCase;
  let repository: jest.Mocked<IOrderRepository>;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllOrdersUseCase,
        {
          provide: 'IOrderRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAllOrdersUseCase>(GetAllOrdersUseCase);
    repository = module.get('IOrderRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all orders', async () => {
    const orders = [
      Order.create([], TEST_UUIDS.ORDER_1, 0, OrderStatus.PENDING),
      Order.create([], TEST_UUIDS.ORDER_2, 0, OrderStatus.PENDING),
    ];

    repository.findAll.mockResolvedValue({
      data: orders,
      total: orders.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const result = await useCase.execute();

    expect(result.data).toEqual(orders);
    expect(result.total).toBe(orders.length);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no orders exist', async () => {
    repository.findAll.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    const result = await useCase.execute();

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });
});
