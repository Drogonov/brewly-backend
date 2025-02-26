import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ICompanyInfoResponse } from 'src/app.common/dto';

// MARK: - Project implementation

export interface IGetUserCompaniesResponse {
    currentCompany: ICompanyInfoResponse;
    companies?: ICompanyInfoResponse[];
}

// MARK: - Swagger class

export class GetUserCompaniesResponseDto implements IGetUserCompaniesResponse {
    @ApiProperty({ description: 'Current company of the user' })
    @IsNotEmpty()
    currentCompany: ICompanyInfoResponse;

    @ApiProperty({ description: 'Other companies of the user' })
    @IsOptional()
    companies?: ICompanyInfoResponse[];
}