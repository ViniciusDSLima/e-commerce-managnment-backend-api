import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateProductUseCase } from './create-product.use-case';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { TEST_UUIDS } from '../__tests__/test-helpers';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
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
        CreateProductUseCase,
        {
          provide: 'IProductRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateProductUseCase>(CreateProductUseCase);
    repository = module.get('IProductRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a product successfully', async () => {
    const dto = {
      name: 'Test Product',
      category: 'Electronics',
      description: 'Test Description',
      price: 100,
      stockQuantity: 10,
    };

    const createdProduct = new Product(
      TEST_UUIDS.PRODUCT_1,
      dto.name,
      dto.category,
      dto.description,
      dto.price,
      dto.stockQuantity,
      new Date(),
      new Date(),
    );

    repository.create.mockResolvedValue(createdProduct);

    const result = await useCase.execute(dto);

    expect(result).toEqual(createdProduct);
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  it('should throw BadRequestException when price is negative', async () => {
    const dto = {
      name: 'Test Product',
      category: 'Electronics',
      price: -100,
      stockQuantity: 10,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when stockQuantity is negative', async () => {
    const dto = {
      name: 'Test Product',
      category: 'Electronics',
      price: 100,
      stockQuantity: -10,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should create product without description', async () => {
    const dto = {
      name: 'Test Product',
      category: 'Electronics',
      price: 100,
      stockQuantity: 10,
    };

    const createdProduct = new Product(
      TEST_UUIDS.PRODUCT_1,
      dto.name,
      dto.category,
      '',
      dto.price,
      dto.stockQuantity,
      new Date(),
      new Date(),
    );

    repository.create.mockResolvedValue(createdProduct);

    const result = await useCase.execute(dto);

    expect(result).toEqual(createdProduct);
    expect(repository.create).toHaveBeenCalledTimes(1);
  });
});
