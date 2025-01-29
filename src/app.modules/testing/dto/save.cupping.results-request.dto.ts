import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveCuppingTestsRequestDto {
    @IsNotEmpty()
    @ApiProperty({ example: 666 })
    userId: number

    @IsNotEmpty()
    @ApiProperty({ example: 666 })
    companyId: number

    @IsNotEmpty()
    @ApiProperty({ example: 666 })
    cuppingId: number

    @ApiProperty({ description: "Tested Samples" })
    samplesTesings: CuppingSampleTesting[];
}

export class CuppingSampleTesting {
    @IsNotEmpty()
    @ApiProperty({ example: 666 })
    sampleTesingId: number;

    @IsNotEmpty()
    @ApiProperty({ example: 666 })
    sampleItemId: number;

    @IsNotEmpty()
    @ApiProperty({ description: "Tested Properties of the sample" })
    properties: CuppingSampleProperty[];
}

export class CuppingSampleProperty {
    @IsNotEmpty()
    @ApiProperty({ example: "Intensity" })
    propertyType: string;

    @IsNotEmpty()
    @ApiProperty({ example: 3 })
    intensity: number;

    @IsNotEmpty()
    @ApiProperty({ example: 3 })
    quality: number;

    @IsNotEmpty()
    @ApiProperty({ example: "высокая интенсивность" })
    comment: string;
}