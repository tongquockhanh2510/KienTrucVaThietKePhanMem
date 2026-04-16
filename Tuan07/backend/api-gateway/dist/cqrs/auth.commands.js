"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntrospectCommand = exports.RegisterCommand = exports.LoginCommand = void 0;
class LoginCommand {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
}
exports.LoginCommand = LoginCommand;
class RegisterCommand {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
}
exports.RegisterCommand = RegisterCommand;
class IntrospectCommand {
    constructor(token) {
        this.token = token;
    }
}
exports.IntrospectCommand = IntrospectCommand;
