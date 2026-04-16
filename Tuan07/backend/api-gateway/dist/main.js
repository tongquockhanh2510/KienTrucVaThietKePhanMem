"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("./config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
    });
    try {
        await app.listen(config_1.config.port, config_1.config.host);
        console.log(`API Gateway running on ${config_1.config.host}:${config_1.config.port}`);
    }
    catch (error) {
        const err = error;
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${config_1.config.port} is already in use. Stop the process on this port before starting api-gateway again.`);
            process.exit(1);
        }
        throw error;
    }
}
bootstrap();
