/*
Custom exception filter for handling class-validator exceptions in websockets.
since by default nestjs dont provide info about the validation errors when usign websockets.

https://stackoverflow.com/questions/60749135/nestjs-validationpipe-in-websocketgateway-returns-internal-server-error
*/

import { ArgumentsHost, BadRequestException, Catch } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";

@Catch(BadRequestException)
export class CustomWsFilterException extends BaseWsExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        const properException = new WsException(exception.getResponse());
        super.catch(properException, host);
    }
}
