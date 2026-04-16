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
exports.ListPaymentsByOrderHandler = exports.GetPaymentByIdHandler = exports.CreatePaymentHandler = exports.ListPaymentsByOrderQuery = exports.GetPaymentByIdQuery = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const config_1 = require("../config");
const gateway_http_service_1 = require("../shared/gateway-http.service");
const payment_commands_1 = require("./payment.commands");
class GetPaymentByIdQuery {
    constructor(id) {
        this.id = id;
    }
}
exports.GetPaymentByIdQuery = GetPaymentByIdQuery;
class ListPaymentsByOrderQuery {
    constructor(orderId) {
        this.orderId = orderId;
    }
}
exports.ListPaymentsByOrderQuery = ListPaymentsByOrderQuery;
let CreatePaymentHandler = class CreatePaymentHandler {
    constructor(http) {
        this.http = http;
    }
    execute(command) {
        return this.http.request(config_1.config.paymentServiceUrl, 'POST', '/payments', {
            body: {
                orderId: command.orderId,
                amount: command.amount,
                method: command.method,
            },
        });
    }
};
exports.CreatePaymentHandler = CreatePaymentHandler;
exports.CreatePaymentHandler = CreatePaymentHandler = __decorate([
    (0, cqrs_1.CommandHandler)(payment_commands_1.CreatePaymentCommand),
    __metadata("design:paramtypes", [gateway_http_service_1.GatewayHttpService])
], CreatePaymentHandler);
let GetPaymentByIdHandler = class GetPaymentByIdHandler {
    constructor(http) {
        this.http = http;
    }
    execute(query) {
        return this.http.request(config_1.config.paymentServiceUrl, 'GET', `/payments/${query.id}`);
    }
};
exports.GetPaymentByIdHandler = GetPaymentByIdHandler;
exports.GetPaymentByIdHandler = GetPaymentByIdHandler = __decorate([
    (0, cqrs_1.QueryHandler)(GetPaymentByIdQuery),
    __metadata("design:paramtypes", [gateway_http_service_1.GatewayHttpService])
], GetPaymentByIdHandler);
let ListPaymentsByOrderHandler = class ListPaymentsByOrderHandler {
    constructor(http) {
        this.http = http;
    }
    execute(query) {
        return this.http.request(config_1.config.paymentServiceUrl, 'GET', `/payments/order/${query.orderId}`);
    }
};
exports.ListPaymentsByOrderHandler = ListPaymentsByOrderHandler;
exports.ListPaymentsByOrderHandler = ListPaymentsByOrderHandler = __decorate([
    (0, cqrs_1.QueryHandler)(ListPaymentsByOrderQuery),
    __metadata("design:paramtypes", [gateway_http_service_1.GatewayHttpService])
], ListPaymentsByOrderHandler);
