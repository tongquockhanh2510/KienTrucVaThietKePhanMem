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
exports.FoodController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const food_queries_1 = require("./cqrs/food.queries");
let FoodController = class FoodController {
    constructor(queryBus) {
        this.queryBus = queryBus;
    }
    getFoods() {
        return this.queryBus.execute(new food_queries_1.ListFoodsQuery());
    }
};
exports.FoodController = FoodController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FoodController.prototype, "getFoods", null);
exports.FoodController = FoodController = __decorate([
    (0, common_1.Controller)('food'),
    __metadata("design:paramtypes", [cqrs_1.QueryBus])
], FoodController);
