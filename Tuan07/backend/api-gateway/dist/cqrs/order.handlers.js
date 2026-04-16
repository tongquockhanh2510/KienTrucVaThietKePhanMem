"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrderByIdHandler = exports.ListOrdersHandler = exports.CreateOrderHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const config_1 = require("../config");
const gateway_http_service_1 = require("../shared/gateway-http.service");
const order_commands_1 = require("./order.commands");
const order_queries_1 = require("./order.queries");
let CreateOrderHandler = class CreateOrderHandler {
    constructor(http) {
        this.http = http;
    }
    execute(command) {
        return this.http.request(config_1.config.orderServiceUrl, 'POST', '/orders', {
            body: {
                userId: command.userId,
                paymentMethod: command.paymentMethod,
                items: command.items,
            },
        });
    }
};
exports.CreateOrderHandler = CreateOrderHandler;
exports.CreateOrderHandler = CreateOrderHandler = __decorate([
    (0, cqrs_1.CommandHandler)(order_commands_1.CreateOrderCommand),
    __metadata("design:paramtypes", [gateway_http_service_1.GatewayHttpService])
], CreateOrderHandler);
let ListOrdersHandler = class ListOrdersHandler {
    constructor(http) {
        this.http = http;
    }
    execute(query) {
        return this.http.request(config_1.config.orderServiceUrl, 'GET', '/orders', {
            query: {
                userId: query.userId,
                status: query.status,
            },
        });
    }
};
exports.ListOrdersHandler = ListOrdersHandler;
exports.ListOrdersHandler = ListOrdersHandler = __decorate([
    (0, cqrs_1.QueryHandler)(order_queries_1.ListOrdersQuery),
    __metadata("design:paramtypes", [gateway_http_service_1.GatewayHttpService])
], ListOrdersHandler);
let GetOrderByIdHandler = class GetOrderByIdHandler {
    constructor(http) {
        this.http = http;
    }
    execute(query) {
        return this.http.request(config_1.config.orderServiceUrl, 'GET', `/orders/${query.id}`);
    }
};
exports.GetOrderByIdHandler = GetOrderByIdHandler;
exports.GetOrderByIdHandler = GetOrderByIdHandler = __decorate([
    (0, cqrs_1.QueryHandler)(order_queries_1.GetOrderByIdQuery),
    __metadata("design:paramtypes", [gateway_http_service_1.GatewayHttpService])
], GetOrderByIdHandler);
