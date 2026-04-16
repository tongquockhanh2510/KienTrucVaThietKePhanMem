"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrderByIdQuery = exports.ListOrdersQuery = void 0;
class ListOrdersQuery {
    constructor(userId, status) {
        this.userId = userId;
        this.status = status;
    }
}
exports.ListOrdersQuery = ListOrdersQuery;
class GetOrderByIdQuery {
    constructor(id) {
        this.id = id;
    }
}
exports.GetOrderByIdQuery = GetOrderByIdQuery;
