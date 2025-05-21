import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CuppingSettingsRequestDto } from './nested/cupping-settings.request.dto';
import { CuppingSampleRequestDto } from './nested/cupping-sample.request.dto';

export class CreateCuppingRequestDto {
    @IsNotEmpty()
    @ApiProperty({ description: "IDs of sample items from warehouse witch are included to cupping"})
    samples: CuppingSampleRequestDto[]

    @IsNotEmpty()
    @ApiProperty({ description: "Cupping Settings" })
    settings: CuppingSettingsRequestDto

    @IsNotEmpty()
    @ApiProperty({ description: "IDs of Users who will be invited to cupping", example: [1, 3, 777] })
    chosenUserIds: number[]
}