import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CuppingSettingsRequestDto } from './cupping-settings.request.dto';

export class CreateCuppingRequestDto {
    @IsNotEmpty()
    @ApiProperty({ example: 666 })
    cuppingCreatorId: number

    @IsNotEmpty()
    @ApiProperty({ example: 666 })
    companyId: number

    @IsNotEmpty()
    @ApiProperty({ description: "IDs of sample items from warehouse witch are included to cupping", example: [1, 3, 777] })
    sampleItemsId: number[]

    @IsNotEmpty()
    @ApiProperty({ description: "Cupping Settings" })
    settings: CuppingSettingsRequestDto

    @IsNotEmpty()
    @ApiProperty({ description: "IDs of Users who will be invited to cupping", example: [1, 3, 777] })
    invitedUsersId: number[]

    @IsNotEmpty()
    @ApiProperty({ example: "Cupping 1" })
    cuppingName: string
}