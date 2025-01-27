import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IErrorFieldResponse {
    fieldCode: string;
    errorMsg: string;
}

export interface IErrorResponse {
    errorMsg?: string;
    errorSubCode: string;
    errorFields?: [IErrorFieldResponse];
};

// MARK: - Swagger class

export class ErrorFieldResponseDto implements IErrorFieldResponse {
    @ApiProperty({
        description: "Name of the field which have error",
        example: 'email'
    })
    fieldCode: string;

    @ApiProperty({ example: 'This email isnt email please check it' })
    errorMsg: string;
}

export class ErrorResponseDto implements IErrorResponse {
    @ApiProperty({ example: 'This email isnt email please check it' })
    errorMsg?: string;

    @ApiProperty({ example: 'INCORRECT_EMAIL' })
    errorSubCode: string;

    @ApiProperty({
        description: 'Array of fields with specified errors',
        example: [{
            fieldCode: "email",
            errorMsg: "This email isnt email please check it"
        }]
    })
    errorFields?: [ErrorFieldResponseDto];
}