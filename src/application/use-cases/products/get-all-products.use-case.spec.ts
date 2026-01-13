import { Test, TestingModule } from '@nestjs/testing';
import { GetAllProductsUseCase } from './get-all-products.use-case';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { TEST_UUIDS } from '../__tests__/test-helpers';

describe('GetAllProductsUseCase', () => {
  let useCase: GetAllProductsUseCase;
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
        GetAllProductsUseCase,
        {
          provide: 'IProductRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAllProductsUseCase>(GetAllProductsUseCase);
    repository = module.get('IProductRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return all products', async () => {
    const products = [
      new Product(
        TEST_UUIDS.PRODUCT_1,
        'Product 1',
        'Category',
        'Desc',
        100,
        10,
        new Date(),
        new Date(),
      ),
      new Product(
        TEST_UUIDS.PRODUCT_2,
        'Product 2',
        'Category',
        'Desc',
        200,
        20,
        new Date(),
        new Date(),
      ),
    ];

    repository.findAll.mockResolvedValue({
      data: products,
      total: products.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const result = await useCase.execute();

    expect(result.data).toEqual(products);
    expect(result.total).toBe(products.length);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no products exist', async () => {
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
