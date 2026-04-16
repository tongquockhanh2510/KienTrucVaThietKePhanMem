import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListFoodsQuery } from './cqrs/food.queries';

@Controller('food')
export class FoodController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  getFoods() {
    return this.queryBus.execute(new ListFoodsQuery());
  }
}
