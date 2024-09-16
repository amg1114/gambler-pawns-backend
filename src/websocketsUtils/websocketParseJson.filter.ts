/*
Custom pipe to parse raw strings to Javascript objects.
since by default nestjs dont do this even if usign @MessageBody(new ValidationPipe({traform: true}))
decorator in websockets.
*/
import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class ParseJsonPipe implements PipeTransform {
    transform(value: any) {
        if (typeof value !== "string") {
            return value; // if not a string, return the value unchanged
        }

        try {
            return JSON.parse(value); // else parse the string to JSON
        } catch (error) {
            //throw new BadRequestException("Invalid JSON payload");
        }
    }
}
