import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePaymentCommand } from './cqrs/payment.commands';
import { GetPaymentByIdQuery, ListPaymentsByOrderQuery } from './cqrs/payment.handlers';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  createPayment(
    @Body() body: { orderId: number; amount: number; method: string }
  ) {
    return this.commandBus.execute(
      new CreatePaymentCommand(body.orderId, body.amount, body.method)
    );
  }

  @Get('order/:orderId')
  listByOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.queryBus.execute(new ListPaymentsByOrderQuery(orderId));
  }

  @Get(':id')
  getPaymentById(@Param('id', ParseIntPipe) id: number) {
    return this.queryBus.execute(new GetPaymentByIdQuery(id));
  }
}
