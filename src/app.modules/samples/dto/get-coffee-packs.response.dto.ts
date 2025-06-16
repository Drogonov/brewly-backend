import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CoffeePackInfoResponseDto, ICoffeePackInfoResponse } from './nested/coffee-pack-info.response.dto';
import { ISampleTypeInfoResponse } from './nested/sample-type-info.response.dto';
import { Type } from 'class-transformer';

// MARK: - Project implementation

export interface IGetCoffeePacksInfoResponse {
    coffeePacksInfo: ICoffeePackInfoResponse[];
}

// MARK: - Swagger class

export class GetCoffeePacksInfoResponseDto implements IGetCoffeePacksInfoResponse {
    @ApiProperty({
        description: 'Current coffee packs of that sample type',
        type: () => CoffeePackInfoResponseDto,
        isArray: true,
    })
    @Type(() => CoffeePackInfoResponseDto)
    coffeePacksInfo: ICoffeePackInfoResponse[];
}