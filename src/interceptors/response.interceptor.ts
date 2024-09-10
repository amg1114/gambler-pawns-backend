import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    HttpException,
    HttpStatus,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

// Interceptor to format the API response
@Injectable()
export class FormatAPIResponseInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        return next.handle().pipe(
            map((res: unknown) => this.responseHandler(res, context)),
            catchError((err: HttpException) =>
                throwError(() => this.errorHandler(err, context)),
            ),
        );
    }

    // format the error response
    errorHandler(exception: HttpException, context: ExecutionContext) {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        delete exception.getStatus;

        console.log(exception);
        response.status(status).json({
            status: false,
            statusCode: status,
            path: request.url,
            data: {
                message: exception.message,
                error: exception.name,
            },
            timestamp: new Date().toISOString(),
        });
    }

    // format the success response
    responseHandler(res: any, context: ExecutionContext) {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const statusCode = response.statusCode;

        return {
            status: true,
            statusCode,
            path: request.url,
            data: res,
            timestamp: new Date().toISOString(),
        };
    }
}
