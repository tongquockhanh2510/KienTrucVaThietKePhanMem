"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderCommand = void 0;
class CreateOrderCommand {
    constructor(userId, paymentMethod, items) {
        this.userId = userId;
        this.paymentMethod = paymentMethod;
        this.items = items;
    }
}
exports.CreateOrderCommand = CreateOrderCommand;
