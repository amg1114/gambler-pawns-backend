import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class ParseJsonPipe implements PipeTransform {
    transform(value: any) {
        if (typeof value !== "string") {
            return value; // Si no es un string, lo devolvemos tal como está
        }

        try {
            return JSON.parse(value); // Intentamos parsear el string
        } catch (error) {
            throw new BadRequestException("Invalid JSON payload");
        }
    }
}
