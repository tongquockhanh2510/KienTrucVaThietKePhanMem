export class CreateOrderCommand {
  constructor(
    public readonly userId: number,
    public readonly paymentMethod: string,
    public readonly items: Array<{
      foodId: number;
      quantity: number;
      foodName?: string;
      foodPrice?: number;
    }>
  ) {}
}
