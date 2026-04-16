"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePaymentCommand = void 0;
class CreatePaymentCommand {
    constructor(orderId, amount, method) {
        this.orderId = orderId;
        this.amount = amount;
        this.method = method;
    }
}
exports.CreatePaymentCommand = CreatePaymentCommand;
