import { Injectable } from '@nestjs/common';
import {
    IGetCompanyDataResponse,
    IGetUserCompaniesResponse,
    StatusResponseDto,
    StatusType
} from './dto';
import { UserRole } from 'src/app.common/dto';

@Injectable()
export class CompanyService {

    async getUserCompanies(
        userId: number,
        currentCompanyId: number
    ): Promise<IGetUserCompaniesResponse> {
        return {
            currentCompany: {
                companyId: 0,
                ownerId: 0,
                companyName: "Personal"
            },
            companies: [
                {
                    companyId: 1,
                    ownerId: 0,
                    companyName: "Znal Coffee"
                },
                {
                    companyId: 2,
                    ownerId: 0,
                    companyName: "Kalipso"
                }
            ]
        };
    }

    async deleteUserCompany(
        userId: number,
        currentCompanyId: number,
        companyId: number
    ): Promise<StatusResponseDto> {
        return {
            status: StatusType.SUCCESS,
            description: "We have deleted all info about this company"
        }
    }

    async getCompanyData(
        userId: number,
        currentCompanyId: number,
        companyId: number
    ): Promise<IGetCompanyDataResponse> {
        return {
            companyInfo: {
                companyId: 0,
                ownerId: 0,
                companyName: "Znak Coffee"
            },
            team: [
                {
                    userId: 0,
                    userName: 'Owner',
                    email: 'owner@test.com',
                    role: UserRole.owner
                },
                {
                    userId: 1,
                    userName: 'Chief',
                    email: 'chief@text.com',
                    role: UserRole.chief
                }
            ]
        }
    }
}