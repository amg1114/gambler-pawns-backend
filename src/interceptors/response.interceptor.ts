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

// API response formatted based on: https://github.com/omniti-labs/jsend
@Injectable()
export class FormatAPIResponseInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        return next.handle().pipe(
            // Format response when successful
            map((data: unknown) => ({
                status: "success",
                timestamp: new Date().toISOString(),
                data,
            })),
            // Format response when error
            catchError((error: unknown) => {
                const statusCode =
                    error instanceof HttpException
                        ? error.getStatus()
                        : HttpStatus.INTERNAL_SERVER_ERROR;

                const errorResponse = {
                    status: "fail",
                    timestamp: new Date().toISOString(),
                    data: {
                        message:
                            error instanceof Error
                                ? error.message
                                : "Internal server error",
                    },
                };

                return throwError(
                    () => new HttpException(errorResponse, statusCode),
                );
            }),
        );
    }
}
