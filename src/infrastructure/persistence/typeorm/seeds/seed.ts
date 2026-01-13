import { ProductTypeOrmEntity } from '../entities/product.typeorm.entity';
import { OrderTypeOrmEntity } from '../entities/order.typeorm.entity';
import { OrderItemTypeOrmEntity } from '../entities/order-item.typeorm.entity';
import { OrderStatus } from '../../../../domain/entities/order.entity';
import dataSource from '../data-source';

async function seed() {
  console.log('Make sure migrations have been run: npm run migration:run');

  const connection = await dataSource.initialize();

  try {
    console.log('Starting database seeding...');
    await connection
      .createQueryBuilder()
      .delete()
      .from(OrderItemTypeOrmEntity)
      .where('1 = 1')
      .execute();

    await connection
      .createQueryBuilder()
      .delete()
      .from(OrderTypeOrmEntity)
      .where('1 = 1')
      .execute();

    await connection
      .createQueryBuilder()
      .delete()
      .from(ProductTypeOrmEntity)
      .where('1 = 1')
      .execute();

    console.log('Cleared existing data');
    const products = [
      {
        name: 'Notebook Dell Inspiron 15',
        category: 'Electronics',
        description:
          'Notebook Dell Inspiron 15 com 8GB RAM, 256GB SSD, Intel Core i5',
        price: 2999.99,
        stockQuantity: 15,
        createdBy: 'system',
      },
      {
        name: 'iPhone 15 Pro',
        category: 'Electronics',
        description:
          'iPhone 15 Pro 256GB, Tela Super Retina XDR de 6.1 polegadas',
        price: 8999.99,
        stockQuantity: 8,
        createdBy: 'system',
      },
      {
        name: 'Samsung Galaxy S24',
        category: 'Electronics',
        description:
          'Samsung Galaxy S24 256GB, Tela Dynamic AMOLED 2X de 6.2 polegadas',
        price: 4999.99,
        stockQuantity: 12,
        createdBy: 'system',
      },
      {
        name: 'Mouse Logitech MX Master 3',
        category: 'Accessories',
        description:
          'Mouse sem fio Logitech MX Master 3, sensor de alta precisão',
        price: 599.99,
        stockQuantity: 25,
        createdBy: 'system',
      },
      {
        name: 'Teclado Mecânico Keychron K2',
        category: 'Accessories',
        description:
          'Teclado mecânico sem fio Keychron K2, switches Gateron Brown',
        price: 799.99,
        stockQuantity: 18,
        createdBy: 'system',
      },
      {
        name: 'Monitor LG UltraWide 29"',
        category: 'Electronics',
        description:
          'Monitor LG UltraWide 29 polegadas, resolução 2560x1080, IPS',
        price: 1899.99,
        stockQuantity: 10,
        createdBy: 'system',
      },
      {
        name: 'Webcam Logitech C920',
        category: 'Accessories',
        description:
          'Webcam Full HD 1080p Logitech C920, microfone estéreo integrado',
        price: 449.99,
        stockQuantity: 20,
        createdBy: 'system',
      },
      {
        name: 'SSD Samsung 1TB NVMe',
        category: 'Components',
        description:
          'SSD Samsung 980 PRO 1TB NVMe M.2, velocidade de leitura até 7000MB/s',
        price: 699.99,
        stockQuantity: 30,
        createdBy: 'system',
      },
    ];

    const savedProducts = await connection.manager.save(
      ProductTypeOrmEntity,
      products,
    );

    console.log(`Created ${savedProducts.length} products`);
    const orders = [
      {
        total: 3599.98,
        status: OrderStatus.COMPLETED,
        createdBy: 'admin',
        items: [
          {
            productId: savedProducts[0].id,
            quantity: 1,
            unitPrice: 2999.99,
            subtotal: 2999.99,
          },
          {
            productId: savedProducts[3].id,
            quantity: 1,
            unitPrice: 599.99,
            subtotal: 599.99,
          },
        ],
      },
      {
        total: 8999.99,
        status: OrderStatus.COMPLETED,
        createdBy: 'admin',
        items: [
          {
            productId: savedProducts[1].id,
            quantity: 1,
            unitPrice: 8999.99,
            subtotal: 8999.99,
          },
        ],
      },
      {
        total: 1299.98,
        status: OrderStatus.PENDING,
        createdBy: 'admin',
        items: [
          {
            productId: savedProducts[4].id,
            quantity: 1,
            unitPrice: 799.99,
            subtotal: 799.99,
          },
          {
            productId: savedProducts[6].id,
            quantity: 1,
            unitPrice: 449.99,
            subtotal: 449.99,
          },
        ],
      },
    ];

    for (const orderData of orders) {
      const order = connection.manager.create(OrderTypeOrmEntity, {
        total: orderData.total,
        status: orderData.status,
        createdBy: orderData.createdBy,
      });

      const savedOrder = await connection.manager.save(order);

      const orderItems = orderData.items.map((item) => {
        const orderItem = connection.manager.create(OrderItemTypeOrmEntity, {
          order: savedOrder,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        });
        return orderItem;
      });

      await connection.manager.save(OrderItemTypeOrmEntity, orderItems);
    }

    console.log(`Created ${orders.length} orders`);

    console.log('Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`   - Products: ${savedProducts.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log('\nYou can now start the application and test the API');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await connection.destroy();
  }
}

seed()
  .then(() => {
    console.log('Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });
