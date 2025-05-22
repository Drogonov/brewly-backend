import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CuppingSettingsRequestDto } from './nested/cupping-settings.request.dto';
import { CuppingSampleRequestDto } from './nested/cupping-sample.request.dto';
import { Type } from 'class-transformer';

export class CreateCuppingRequestDto {
    @IsNotEmpty()
    @Type(() => CuppingSampleRequestDto)
    @ApiProperty({ description: "IDs of sample items from warehouse witch are included to cupping" })
    samples: CuppingSampleRequestDto[]

    @IsNotEmpty()
    @Type(() => CuppingSettingsRequestDto)
    @ApiProperty({ description: "Cupping Settings" })
    settings: CuppingSettingsRequestDto

    @ApiProperty({
        description: "IDs of Users who will be invited to cupping",
        type: [Number],
        example: [1, 3, 777],
    })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    @Type(() => Number)
    chosenUserIds?: number[]
}