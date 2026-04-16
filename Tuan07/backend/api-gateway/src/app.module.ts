import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthController } from './auth.controller';
import { FoodController } from './food.controller';
import { OrderController } from './order.controller';
import { PaymentController } from './payment.controller';
import { config } from './config';
import { GatewayHttpService } from './shared/gateway-http.service';
import { IntrospectHandler, LoginHandler, RegisterHandler } from './cqrs/auth.handlers';
import { ListFoodsHandler } from './cqrs/food.handlers';
import { CreateOrderHandler, GetOrderByIdHandler, ListOrdersHandler } from './cqrs/order.handlers';
import { CreatePaymentHandler, GetPaymentByIdHandler, ListPaymentsByOrderHandler } from './cqrs/payment.handlers';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
  ],
  controllers: [AppController, AuthController, FoodController, OrderController, PaymentController],
  providers: [
    GatewayHttpService,
    LoginHandler,
    RegisterHandler,
    IntrospectHandler,
    ListFoodsHandler,
    CreateOrderHandler,
    ListOrdersHandler,
    GetOrderByIdHandler,
    CreatePaymentHandler,
    GetPaymentByIdHandler,
    ListPaymentsByOrderHandler,
    {
      provide: 'GATEWAY_CONFIG',
      useValue: config,
    },
  ],
})
export class AppModule {}
