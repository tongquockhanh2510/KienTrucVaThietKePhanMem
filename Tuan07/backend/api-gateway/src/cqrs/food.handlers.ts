import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { config } from '../config';
import { GatewayHttpService } from '../shared/gateway-http.service';
import { ListFoodsQuery } from './food.queries';

@QueryHandler(ListFoodsQuery)
export class ListFoodsHandler implements IQueryHandler<ListFoodsQuery> {
  constructor(private readonly http: GatewayHttpService) {}

  execute() {
    return this.http.request(config.foodServiceUrl, 'GET', '/food');
  }
}
