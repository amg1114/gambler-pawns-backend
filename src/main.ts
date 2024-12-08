import { ConfigService } from "@nestjs/config";
import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import morgan from "morgan";
import { CORS } from "./config/constants";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import metadata from "./metadata";
import { FormatAPIResponseInterceptor } from "./common/interceptors/response.interceptor";
import { EventEmitter } from "events";

async function bootstrap() {
    // Set the max listeners for EventEmitter
    EventEmitter.defaultMaxListeners = 20;

    const app = await NestFactory.create(AppModule);
    const reflector = app.get(Reflector);
    app.use(morgan("dev"));
    const configService = app.get(ConfigService);
    app.enableCors(CORS);

    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: false,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle("Gambler Pawns API Documentation")
        .setDescription(
            "This document contains the API documentation for all the endpoints of the Gambler Pawns project.",
        )
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    await SwaggerModule.loadPluginMetadata(metadata);
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/v1", app, document);
    // interceptor for standard api response
    app.useGlobalInterceptors(
        new FormatAPIResponseInterceptor(),
        new ClassSerializerInterceptor(reflector),
    );

    await app.listen(configService.get<string>("PORT"));
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
