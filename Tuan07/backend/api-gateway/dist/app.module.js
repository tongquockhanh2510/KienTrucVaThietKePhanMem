"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const auth_controller_1 = require("./auth.controller");
const food_controller_1 = require("./food.controller");
const order_controller_1 = require("./order.controller");
const payment_controller_1 = require("./payment.controller");
const config_2 = require("./config");
const gateway_http_service_1 = require("./shared/gateway-http.service");
const auth_handlers_1 = require("./cqrs/auth.handlers");
const food_handlers_1 = require("./cqrs/food.handlers");
const order_handlers_1 = require("./cqrs/order.handlers");
const payment_handlers_1 = require("./cqrs/payment.handlers");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            cqrs_1.CqrsModule,
        ],
        controllers: [app_controller_1.AppController, auth_controller_1.AuthController, food_controller_1.FoodController, order_controller_1.OrderController, payment_controller_1.PaymentController],
        providers: [
            gateway_http_service_1.GatewayHttpService,
            auth_handlers_1.LoginHandler,
            auth_handlers_1.RegisterHandler,
            auth_handlers_1.IntrospectHandler,
            food_handlers_1.ListFoodsHandler,
            order_handlers_1.CreateOrderHandler,
            order_handlers_1.ListOrdersHandler,
            order_handlers_1.GetOrderByIdHandler,
            payment_handlers_1.CreatePaymentHandler,
            payment_handlers_1.GetPaymentByIdHandler,
            payment_handlers_1.ListPaymentsByOrderHandler,
            {
                provide: 'GATEWAY_CONFIG',
                useValue: config_2.config,
            },
        ],
    })
], AppModule);
