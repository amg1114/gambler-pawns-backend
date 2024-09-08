import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import morgan from "morgan";
import { CORS } from "./constants";
import { ValidationPipe } from "@nestjs/common";
import { ResponseInterceptor } from "./response/response.interceptor";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(morgan("dev"));
    const configService = app.get(ConfigService);
    app.enableCors(CORS);

    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // interceptor for standard api response
    app.useGlobalInterceptors(new ResponseInterceptor());

    await app.listen(configService.get<string>("PORT"));
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
