import { NestFactory } from "@nestjs/core";
import * as bodyParser from "body-parser";
import { AppModule } from "./app.module";
import pinoHttp from "pino-http";
import { logger } from "./common/logger/pino";
import type { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const config = app.get(ConfigService);

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

  app.use(pinoHttp({ logger }));
  // Capture raw body for HMAC signature verification
  app.use(
    bodyParser.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  const port = Number(process.env.API_PORT || 3001);
  await app.listen(port);
  logger.info({ port }, "API listening");

  app.use(
    bodyParser.json({
      verify: (
        req: Request & { rawBody?: Buffer },
        _res: Response,
        buf: Buffer,
      ) => {
        req.rawBody = buf;
      },
    }),
  );
}

bootstrap();
