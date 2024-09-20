import { ApiProperty } from "@nestjs/swagger";
import { IsObject } from "class-validator";
import { BaseResponse } from "src/config/interfaces/base-response.interface";
import { UpdateResult } from "typeorm";

export class UpdateUserResponse extends BaseResponse {
    @IsObject()
    @ApiProperty({ example: { raw: [], affected: 1, generatedMaps: [] } })
    data: any
}