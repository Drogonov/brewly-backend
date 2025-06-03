import { IsNotEmpty, IsString, IsEmail, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidationErrorKeys } from 'src/app.common/localization/generated';

export class CuppingSampleRequestDto {
    @IsNotEmpty({
        context: { validationErrorKey: ValidationErrorKeys.SAMPLE_ID_REQUIRED },
    })
    @Type(() => Number)
    @IsInt({
        context: { validationErrorKey: ValidationErrorKeys.SAMPLE_ID_MUST_BE_INT },
    })
    @Min(1, {
        context: { validationErrorKey: ValidationErrorKeys.SAMPLE_ID_MUST_BE_POSITIVE },
    })
    @ApiProperty({ description: 'ID of the sample type' })
    sampleId: number

    @IsNotEmpty({
        context: { validationErrorKey: ValidationErrorKeys.PACK_ID_REQUIRED },
    })
    @Type(() => Number)
    @IsInt({
        context: { validationErrorKey: ValidationErrorKeys.PACK_ID_MUST_BE_INT },
    })
    @Min(1, {
        context: { validationErrorKey: ValidationErrorKeys.PACK_ID_MUST_BE_POSITIVE },
    })
    @ApiProperty({ description: 'ID of the coffee pack' })
    packId: number

    @IsOptional()
    @IsString({
      context: { validationErrorKey: ValidationErrorKeys.HIDDEN_NAME_INVALID_CHARS },
    })
    @ApiProperty({ description: 'Hidden sample name (optional)' })
    hiddenSampleName?: string
}