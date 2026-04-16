"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayHttpService = void 0;
const common_1 = require("@nestjs/common");
let GatewayHttpService = class GatewayHttpService {
    async request(baseUrl, method, path, options) {
        const url = new URL(path, baseUrl);
        if (options?.query) {
            for (const [key, value] of Object.entries(options.query)) {
                if (value !== undefined && value !== null && value !== '') {
                    url.searchParams.set(key, String(value));
                }
            }
        }
        const response = await fetch(url, {
            method,
            headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
            body: options?.body ? JSON.stringify(options.body) : undefined,
        });
        const text = await response.text();
        const payload = text ? this.parseBody(text) : null;
        if (!response.ok) {
            const message = this.extractMessage(payload) || response.statusText || 'Upstream service error';
            throw new common_1.HttpException(message, response.status);
        }
        return payload;
    }
    parseBody(text) {
        try {
            return JSON.parse(text);
        }
        catch {
            return text;
        }
    }
    extractMessage(payload) {
        if (!payload) {
            return undefined;
        }
        if (typeof payload === 'string') {
            return payload;
        }
        if (typeof payload === 'object' && payload !== null) {
            const candidate = payload;
            if (typeof candidate.message === 'string') {
                return candidate.message;
            }
            if (typeof candidate.error === 'string') {
                return candidate.error;
            }
        }
        return undefined;
    }
};
exports.GatewayHttpService = GatewayHttpService;
exports.GatewayHttpService = GatewayHttpService = __decorate([
    (0, common_1.Injectable)()
], GatewayHttpService);
