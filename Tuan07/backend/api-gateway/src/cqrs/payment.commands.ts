export class CreatePaymentCommand {
  constructor(
    public readonly orderId: number,
    public readonly amount: number,
    public readonly method: string
  ) {}
}
