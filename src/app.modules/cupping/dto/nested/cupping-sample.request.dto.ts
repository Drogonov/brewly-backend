import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CuppingSampleRequestDto {
    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({ description: "Id of the sample type" })
    sampleId: number

    @IsNotEmpty()
    @Type(() => Number)
    @ApiProperty({ description: "Id of the cofee pack" })
    packId: number

    @IsOptional()
    hiddenSampleName?: string
}