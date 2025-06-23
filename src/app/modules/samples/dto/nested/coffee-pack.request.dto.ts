import { IsNotEmpty, IsString, IsEmail, IsDate, IsDateString, IsOptional, IsNumber, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BooleanTransformer } from 'src/app/common/decorators';
import { ValidationErrorKeys } from 'src/app/common/localization/generated';

export class CoffeePackRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ context: { validationErrorKey: ValidationErrorKeys.PACK_ID_MUST_BE_INT } })
  @Min(1, { context: { validationErrorKey: ValidationErrorKeys.PACK_ID_MUST_BE_POSITIVE } })
  @ApiPropertyOptional({ example: 666, description: 'If updating an existing pack, its ID.' })
  packId?: number;

  // ISO8601 format date
  @IsNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.DATE_REQUIRED } })
  @IsDateString(
    {},
    { context: { validationErrorKey: ValidationErrorKeys.DATE_INVALID } }
  )
  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Roast date in ISO 8601 format' })
  roastDate: string;

  // ISO8601 format date
  @IsOptional()
  @IsDateString({}, { context: { validationErrorKey: ValidationErrorKeys.DATE_INVALID } })
  @ApiPropertyOptional({ example: '2025-01-05T00:00:00Z', description: 'Open date (ISO 8601). If not yet opened, omit.' })
  openDate?: string;

  @IsNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN } })
  @BooleanTransformer()
  @IsBoolean({ context: { validationErrorKey: ValidationErrorKeys.INVALID_BOOLEAN } })
  @ApiPropertyOptional({ example: false, description: 'Whether this pack is finished/over.' })
  packIsOver: boolean


  @IsNotEmpty({ context: { validationErrorKey: ValidationErrorKeys.NUMBER_REQUIRED } })
  @Type(() => Number)
  @IsInt({ context: { validationErrorKey: ValidationErrorKeys.NUMBER_INVALID } })
  @Min(1, { context: { validationErrorKey: ValidationErrorKeys.NUMBER_MUST_BE_POSITIVE } })
  @ApiProperty({ example: 250, description: 'Weight in grams.' })
  weight: number;

  @IsOptional()
  @IsString({ context: { validationErrorKey: ValidationErrorKeys.INVALID_CHARS } })
  @ApiPropertyOptional({ example: 'ABC123XYZ', description: 'Optional barcode string.' })
  barCode?: string;
}