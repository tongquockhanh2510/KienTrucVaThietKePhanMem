import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { config } from '../config';
import { GatewayHttpService } from '../shared/gateway-http.service';
import { CreateOrderCommand } from './order.commands';
import { GetOrderByIdQuery, ListOrdersQuery } from './order.queries';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(private readonly http: GatewayHttpService) {}

  execute(command: CreateOrderCommand) {
    return this.http.request(config.orderServiceUrl, 'POST', '/orders', {
      body: {
        userId: command.userId,
        paymentMethod: command.paymentMethod,
        items: command.items,
      },
    });
  }
}

@QueryHandler(ListOrdersQuery)
export class ListOrdersHandler implements IQueryHandler<ListOrdersQuery> {
  constructor(private readonly http: GatewayHttpService) {}

  execute(query: ListOrdersQuery) {
    return this.http.request(config.orderServiceUrl, 'GET', '/orders', {
      query: {
        userId: query.userId,
        status: query.status,
      },
    });
  }
}

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdHandler implements IQueryHandler<GetOrderByIdQuery> {
  constructor(private readonly http: GatewayHttpService) {}

  execute(query: GetOrderByIdQuery) {
    return this.http.request(config.orderServiceUrl, 'GET', `/orders/${query.id}`);
  }
}
