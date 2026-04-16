import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { config } from '../config';
import { GatewayHttpService } from '../shared/gateway-http.service';
import { CreatePaymentCommand } from './payment.commands';

export class GetPaymentByIdQuery {
  constructor(public readonly id: number) {}
}

export class ListPaymentsByOrderQuery {
  constructor(public readonly orderId: number) {}
}

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler implements ICommandHandler<CreatePaymentCommand> {
  constructor(private readonly http: GatewayHttpService) {}

  execute(command: CreatePaymentCommand) {
    return this.http.request(config.paymentServiceUrl, 'POST', '/payments', {
      body: {
        orderId: command.orderId,
        amount: command.amount,
        method: command.method,
      },
    });
  }
}

@QueryHandler(GetPaymentByIdQuery)
export class GetPaymentByIdHandler implements IQueryHandler<GetPaymentByIdQuery> {
  constructor(private readonly http: GatewayHttpService) {}

  execute(query: GetPaymentByIdQuery) {
    return this.http.request(config.paymentServiceUrl, 'GET', `/payments/${query.id}`);
  }
}

@QueryHandler(ListPaymentsByOrderQuery)
export class ListPaymentsByOrderHandler implements IQueryHandler<ListPaymentsByOrderQuery> {
  constructor(private readonly http: GatewayHttpService) {}

  execute(query: ListPaymentsByOrderQuery) {
    return this.http.request(config.paymentServiceUrl, 'GET', `/payments/order/${query.orderId}`);
  }
}
