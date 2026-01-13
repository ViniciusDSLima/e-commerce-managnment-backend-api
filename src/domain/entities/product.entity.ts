export class Product {
  constructor(
    public readonly id: string | undefined,
    public readonly name: string,
    public readonly category: string,
    public readonly description: string,
    public readonly price: number,
    public stockQuantity: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  hasStock(quantity: number): boolean {
    return this.stockQuantity >= quantity;
  }

  decreaseStock(quantity: number): void {
    if (!this.hasStock(quantity)) {
      throw new Error(
        `Insufficient stock. Available: ${this.stockQuantity}, Requested: ${quantity}`,
      );
    }
    this.stockQuantity -= quantity;
  }

  increaseStock(quantity: number): void {
    this.stockQuantity += quantity;
  }

  updatePrice(newPrice: number): void {
    if (newPrice < 0) {
      throw new Error('Price cannot be negative');
    }
    (this as any).price = newPrice;
  }

  updateStock(newStock: number): void {
    if (newStock < 0) {
      throw new Error('Stock cannot be negative');
    }
    this.stockQuantity = newStock;
  }
}
