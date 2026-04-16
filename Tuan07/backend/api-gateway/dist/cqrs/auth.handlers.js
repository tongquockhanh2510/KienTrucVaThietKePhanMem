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
exports.IntrospectHandler = exports.RegisterHandler = exports.LoginHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const config_1 = require("../config");
const gateway_http_service_1 = require("../shared/gateway-http.service");
const auth_commands_1 = require("./auth.commands");
let LoginHandler = class LoginHandler {
    constructor(http) {
        this.http = http;
    }
    execute(command) {
        return this.http.request(config_1.config.authServiceUrl, 'POST', '/auth/login', {
            body: { username: command.username, password: command.password },
        });
    }
};
exports.LoginHandler = LoginHandler;
exports.LoginHandler = LoginHandler = __decorate([
    (0, cqrs_1.CommandHandler)(auth_commands_1.LoginCommand),
    __metadata("design:paramtypes", [gateway_http_service_1.GatewayHttpService])
], LoginHandler);
let RegisterHandler = class RegisterHandler {
    constructor(http) {
        this.http = http;
    }
    execute(command) {
        return this.http.request(config_1.config.authServiceUrl, 'POST', '/auth/register', {
            body: {
                username: command.username,
                email: command.email,
                password: command.password,
            },
        });
    }
};
exports.RegisterHandler = RegisterHandler;
exports.RegisterHandler = RegisterHandler = __decorate([
    (0, cqrs_1.CommandHandler)(auth_commands_1.RegisterCommand),
    __metadata("design:paramtypes", [gateway_http_service_1.GatewayHttpService])
], RegisterHandler);
let IntrospectHandler = class IntrospectHandler {
    constructor(http) {
        this.http = http;
    }
    execute(command) {
        return this.http.request(config_1.config.authServiceUrl, 'POST', '/auth/introspect', {
            body: { token: command.token },
        });
    }
};
exports.IntrospectHandler = IntrospectHandler;
exports.IntrospectHandler = IntrospectHandler = __decorate([
    (0, cqrs_1.CommandHandler)(auth_commands_1.IntrospectCommand),
    __metadata("design:paramtypes", [gateway_http_service_1.GatewayHttpService])
], IntrospectHandler);
