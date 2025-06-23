import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { CompanyInfoResponseDto, ICompanyInfoResponse } from 'src/app/common/dto';

// MARK: - Project implementation

export interface IGetUserCompaniesResponse {
    currentCompany: ICompanyInfoResponse;
    companies?: ICompanyInfoResponse[];
}

// MARK: - Swagger class

export class GetUserCompaniesResponseDto implements IGetUserCompaniesResponse {
    @ApiProperty({
        description: 'Current company of the user',
        type: () => CompanyInfoResponseDto
    })
    @IsNotEmpty()
    @Type(() => CompanyInfoResponseDto)
    currentCompany: ICompanyInfoResponse;

    @ApiPropertyOptional({ description: 'Other companies of the user',
        type: () => CompanyInfoResponseDto,
        isArray: true
    })
    @IsOptional()
    @Type(() => CompanyInfoResponseDto)
    companies?: ICompanyInfoResponse[];
}