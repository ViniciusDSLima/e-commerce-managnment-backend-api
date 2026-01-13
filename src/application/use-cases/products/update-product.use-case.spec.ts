import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UpdateProductUseCase } from './update-product.use-case';
import { GetProductByIdUseCase } from './get-product-by-id.use-case';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { TEST_UUIDS } from '../__tests__/test-helpers';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
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
        UpdateProductUseCase,
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

    useCase = module.get<UpdateProductUseCase>(UpdateProductUseCase);
    repository = module.get('IProductRepository');
    getProductByIdUseCase = module.get(GetProductByIdUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a product successfully', async () => {
    const existingProduct = new Product(
      TEST_UUIDS.PRODUCT_1,
      'Old Name',
      'Category',
      'Description',
      100,
      10,
      new Date(),
      new Date(),
    );

    const updatedProduct = new Product(
      TEST_UUIDS.PRODUCT_1,
      'New Name',
      'New Category',
      'New Description',
      200,
      20,
      new Date(),
      new Date(),
    );

    getProductByIdUseCase.execute.mockResolvedValue(existingProduct);
    repository.update.mockResolvedValue(updatedProduct);

    const dto = {
      name: 'New Name',
      category: 'New Category',
      description: 'New Description',
      price: 200,
      stockQuantity: 20,
    };

    const result = await useCase.execute(TEST_UUIDS.PRODUCT_1, dto);

    expect(result).toEqual(updatedProduct);
    expect(getProductByIdUseCase.execute).toHaveBeenCalledWith(
      TEST_UUIDS.PRODUCT_1,
    );
    expect(repository.update).toHaveBeenCalledWith(
      TEST_UUIDS.PRODUCT_1,
      expect.objectContaining(dto),
      undefined,
    );
  });

  it('should throw BadRequestException when price is negative', async () => {
    const existingProduct = new Product(
      TEST_UUIDS.PRODUCT_1,
      'Product',
      'Category',
      'Description',
      100,
      10,
      new Date(),
      new Date(),
    );

    getProductByIdUseCase.execute.mockResolvedValue(existingProduct);

    const dto = { price: -100 };

    await expect(useCase.execute(TEST_UUIDS.PRODUCT_1, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when stockQuantity is negative', async () => {
    const existingProduct = new Product(
      TEST_UUIDS.PRODUCT_1,
      'Product',
      'Category',
      'Description',
      100,
      10,
      new Date(),
      new Date(),
    );

    getProductByIdUseCase.execute.mockResolvedValue(existingProduct);

    const dto = { stockQuantity: -10 };

    await expect(useCase.execute(TEST_UUIDS.PRODUCT_1, dto)).rejects.toThrow(
      BadRequestException,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should update only provided fields', async () => {
    const existingProduct = new Product(
      TEST_UUIDS.PRODUCT_1,
      'Product',
      'Category',
      'Description',
      100,
      10,
      new Date(),
      new Date(),
    );

    const updatedProduct = new Product(
      TEST_UUIDS.PRODUCT_1,
      'Product',
      'Category',
      'Description',
      200,
      10,
      new Date(),
      new Date(),
    );

    getProductByIdUseCase.execute.mockResolvedValue(existingProduct);
    repository.update.mockResolvedValue(updatedProduct);

    const dto = { price: 200 };

    const result = await useCase.execute(TEST_UUIDS.PRODUCT_1, dto);

    expect(result).toEqual(updatedProduct);
    expect(repository.update).toHaveBeenCalledWith(
      TEST_UUIDS.PRODUCT_1,
      { price: 200 },
      undefined,
    );
  });
});
