import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICompanyInfoResponse, IUserInfoResponse } from 'src/app.common/dto';

// MARK: - Project implementation

export interface IGetCompanyDataResponse {
    companyInfo: ICompanyInfoResponse;
    team: IUserInfoResponse[];
}

// MARK: - Swagger class

export class GetCompanyDataResponseDto implements IGetCompanyDataResponse {
    @ApiProperty({ description: "Info about Company" })
    companyInfo: ICompanyInfoResponse;

    @ApiProperty({ description: "Team of the company with all roles" })
    team: IUserInfoResponse[];
}