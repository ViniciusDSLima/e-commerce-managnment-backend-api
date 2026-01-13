import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetOrderByIdUseCase } from './get-order-by-id.use-case';
import { IOrderRepository } from '../../../domain/repositories/order.repository.interface';
import { Order, OrderStatus } from '../../../domain/entities/order.entity';
import { TEST_UUIDS } from '../__tests__/test-helpers';

describe('GetOrderByIdUseCase', () => {
  let useCase: GetOrderByIdUseCase;
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
        GetOrderByIdUseCase,
        {
          provide: 'IOrderRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetOrderByIdUseCase>(GetOrderByIdUseCase);
    repository = module.get('IOrderRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return an order when found', async () => {
    const order = Order.createWithId(
      TEST_UUIDS.ORDER_1,
      [],
      0,
      OrderStatus.PENDING,
    );

    repository.findById.mockResolvedValue(order);

    const result = await useCase.execute(TEST_UUIDS.ORDER_1);

    expect(result).toEqual(order);
    expect(repository.findById).toHaveBeenCalledWith(TEST_UUIDS.ORDER_1);
  });

  it('should throw NotFoundException when order not found', async () => {
    const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(nonExistentId)).rejects.toThrow(
      NotFoundException,
    );
    expect(repository.findById).toHaveBeenCalledWith(nonExistentId);
  });
});
