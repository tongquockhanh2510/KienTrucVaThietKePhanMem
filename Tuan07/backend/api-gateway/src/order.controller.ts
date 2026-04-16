import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateOrderCommand } from './cqrs/order.commands';
import { GetOrderByIdQuery, ListOrdersQuery } from './cqrs/order.queries';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  createOrder(
    @Body()
    body: {
      userId: number;
      paymentMethod: string;
      items: Array<{
        foodId: number;
        quantity: number;
        foodName?: string;
        foodPrice?: number;
      }>;
    }
  ) {
    return this.commandBus.execute(
      new CreateOrderCommand(body.userId, body.paymentMethod, body.items)
    );
  }

  @Get()
  listOrders(@Query('userId') userId?: string, @Query('status') status?: string) {
    return this.queryBus.execute(
      new ListOrdersQuery(
        userId !== undefined ? Number(userId) : undefined,
        status
      )
    );
  }

  @Get(':id')
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetOrderByIdQuery(id));
  }
}
