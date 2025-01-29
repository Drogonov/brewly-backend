import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetCuppingResultsRequestDto {
    @IsNotEmpty()
    @ApiProperty({ example: 666 })
    userId: number

    @IsNotEmpty()
    @ApiProperty({ example: 666 })
    companyId: number

    @IsNotEmpty()
    @ApiProperty({ example: 666 })
    cuppingId: number
}