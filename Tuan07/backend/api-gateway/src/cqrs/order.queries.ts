export class ListOrdersQuery {
  constructor(
    public readonly userId?: number,
    public readonly status?: string
  ) {}
}

export class GetOrderByIdQuery {
  constructor(public readonly id: number) {}
}
