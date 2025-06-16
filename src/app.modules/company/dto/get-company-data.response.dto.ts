import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { CompanyInfoResponseDto, ICompanyInfoResponse, IUserInfoResponse, UserInfoResponseDto } from 'src/app.common/dto';

// MARK: - Project implementation

export interface IGetCompanyDataResponse {
    companyInfo: ICompanyInfoResponse;
    team?: IUserInfoResponse[];
}

// MARK: - Swagger class

export class GetCompanyDataResponseDto implements IGetCompanyDataResponse {
    @ApiProperty({ description: "Info about Company" })
    @IsNotEmpty()
    @Type(() => CompanyInfoResponseDto)
    companyInfo: ICompanyInfoResponse;

    @ApiPropertyOptional({ description: "Team of the company with all roles", type: [UserInfoResponseDto] })
    @IsOptional()
    @Type(() => UserInfoResponseDto)
    team?: IUserInfoResponse[];
}