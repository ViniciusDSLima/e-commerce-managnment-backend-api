import { Test, TestingModule } from '@nestjs/testing';
import { DeleteProductUseCase } from './delete-product.use-case';
import { GetProductByIdUseCase } from './get-product-by-id.use-case';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { TEST_UUIDS } from '../__tests__/test-helpers';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
  let repository: jest.Mocked<IProductRepository>;
  let getProductByIdUseCase: jest.Mocked<GetProductByIdUseCase>;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByIds: jest.fn(),
    updateStock: jest.fn(),
  };

  const mockGetProductByIdUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProductUseCase,
        {
          provide: 'IProductRepository',
          useValue: mockRepository,
        },
        {
          provide: GetProductByIdUseCase,
          useValue: mockGetProductByIdUseCase,
        },
      ],
    }).compile();

    useCase = module.get<DeleteProductUseCase>(DeleteProductUseCase);
    repository = module.get('IProductRepository');
    getProductByIdUseCase = module.get(GetProductByIdUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delete a product successfully', async () => {
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

    getProductByIdUseCase.execute.mockResolvedValue(product);
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute(TEST_UUIDS.PRODUCT_1);

    expect(getProductByIdUseCase.execute).toHaveBeenCalledWith(
      TEST_UUIDS.PRODUCT_1,
    );
    expect(repository.delete).toHaveBeenCalledWith(TEST_UUIDS.PRODUCT_1);
  });

  it('should throw NotFoundException when product not found', async () => {
    getProductByIdUseCase.execute.mockRejectedValue(
      new Error('Product not found'),
    );

    const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';
    await expect(useCase.execute(nonExistentId)).rejects.toThrow();
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
