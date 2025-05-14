import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICoffeePackInfoResponse } from './nested/coffee-pack-info.response.dto';
import { ISampleTypeInfoResponse } from './nested/sample-type-info.response.dto';

// MARK: - Project implementation

export interface IGetCoffeePacksInfoResponse {
    coffeePacksInfo: ICoffeePackInfoResponse[];
}

// MARK: - Swagger class

export class GetCoffeePacksInfoResponseDto implements IGetCoffeePacksInfoResponse {
    @ApiProperty({ example: 'Current coffee packs of that sample type' })
    coffeePacksInfo: ICoffeePackInfoResponse[];
}