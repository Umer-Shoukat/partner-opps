"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const bodyParser = require("body-parser");
const app_module_1 = require("./app.module");
const pino_http_1 = require("pino-http");
const pino_1 = require("./common/logger/pino");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bodyParser: false });
    const config = app.get(config_1.ConfigService);
    app.enableCors({
        origin: ["http://localhost:3000"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-App-Key-Id",
            "X-App-Timestamp",
            "X-App-Nonce",
            "X-App-Signature",
        ],
    });
    app.use((0, pino_http_1.default)({ logger: pino_1.logger }));
    app.use(bodyParser.json({
        verify: (req, _res, buf) => {
            req.rawBody = buf;
        },
    }));
    const port = Number(process.env.API_PORT || 3001);
    await app.listen(port);
    pino_1.logger.info({ port }, "API listening");
    app.use(bodyParser.json({
        verify: (req, _res, buf) => {
            req.rawBody = buf;
        },
    }));
}
bootstrap();
//# sourceMappingURL=main.js.map