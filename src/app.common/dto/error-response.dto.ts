import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ErrorFieldCode, ErrorFieldCodeType } from 'src/app.common/error-handling/exceptions';

// MARK: - Project implementation

export interface IErrorFieldResponse {
    fieldCode: string;
    errorMsg: string;
}

export interface IErrorResponse {
    errorMsg?: string;
    errorSubCode: string;
    errorFields?: IErrorFieldResponse[];
};

// MARK: - Swagger class

export class ErrorFieldResponseDto implements IErrorFieldResponse {
    @ApiProperty({ example: 'email', enum: Object.values(ErrorFieldCode) })
    fieldCode: ErrorFieldCodeType;

    @ApiProperty({ example: 'This email isnt email please check it' })
    errorMsg: string;
}

export class ErrorResponseDto implements IErrorResponse {
    @ApiProperty({ example: 'This email isnt email please check it' })
    errorMsg?: string;

    @ApiProperty({
        description: 'Machine-readable sub-code for this business error',
        example: 'INCORRECT_EMAIL',
      })
    errorSubCode: string;

    @ApiPropertyOptional({
        description: 'Array of fields with specified errors',
        example: [{
            fieldCode: "email",
            errorMsg: "This email isnt email please check it"
        }]
    })
    errorFields?: ErrorFieldResponseDto[];
}