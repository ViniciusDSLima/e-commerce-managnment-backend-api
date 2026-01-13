import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetProductByIdUseCase } from './get-product-by-id.use-case';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { TEST_UUIDS } from '../__tests__/test-helpers';

describe('GetProductByIdUseCase', () => {
  let useCase: GetProductByIdUseCase;
  let repository: jest.Mocked<IProductRepository>;

  const mockRepository = {
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
        GetProductByIdUseCase,
        {
          provide: 'IProductRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetProductByIdUseCase>(GetProductByIdUseCase);
    repository = module.get('IProductRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a product when found', async () => {
    const product = new Product(
      TEST_UUIDS.PRODUCT_1,
      'Test Product',
      'Category',
      'Description',
      100,
      10,
      new Date(),
      new Date(),
    );

    repository.findById.mockResolvedValue(product);

    const result = await useCase.execute(TEST_UUIDS.PRODUCT_1);

    expect(result).toEqual(product);
    expect(repository.findById).toHaveBeenCalledWith(TEST_UUIDS.PRODUCT_1);
  });

  it('should throw NotFoundException when product not found', async () => {
    const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(nonExistentId)).rejects.toThrow(
      NotFoundException,
    );
    expect(repository.findById).toHaveBeenCalledWith(nonExistentId);
  });
});
