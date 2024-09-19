import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import morgan from "morgan";
import { CORS } from "./config/constants";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import metadata from "./metadata";
import { FormatAPIResponseInterceptor } from "./interceptors/response.interceptor";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

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
        .build();
    await SwaggerModule.loadPluginMetadata(metadata);
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/v1", app, document);
    // interceptor for standard api response
    app.useGlobalInterceptors(new FormatAPIResponseInterceptor());

    await app.listen(configService.get<string>("PORT"));
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
