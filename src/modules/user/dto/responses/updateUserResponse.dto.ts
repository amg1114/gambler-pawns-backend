import { ApiProperty } from "@nestjs/swagger";
import { BaseResponse } from "src/config/interfaces/base-response.interface";

//TODO: This response DTO is not used in any controller.
//It needs to be updated and there needs to be all possible responses for this endpoint.

export class UpdateUserResponse extends BaseResponse {
    @ApiProperty({ example: { raw: [], affected: 1, generatedMaps: [] } })
    data: any;
}
