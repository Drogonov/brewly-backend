import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/app.services/prisma/prisma.service';
import {
  EditCompanyRequestDto,
  IGetCompanyDataResponse,
  IGetUserCompaniesResponse,
  StatusResponseDto,
  StatusType,
  ICompanyInfoResponse,
  UserRole
} from './dto';
import { Company, Role } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
  ) { }

  // Retrieves all companies the user is involved in and distinguishes the current company.
  async getUserCompanies(
    userId: number,
    currentCompanyId: number,
  ): Promise<IGetUserCompaniesResponse> {
    const relations = await this.prisma.userToCompanyRelation.findMany({
      where: { userId },
      include: { company: { include: { relatedToUsers: true } } },
    });

    const currentCompany = relations.find((relation) => relation.companyId === currentCompanyId).company;
    const companies = relations.filter((relation) => relation.companyId !== currentCompanyId);

    const mapCompany = (company: any): ICompanyInfoResponse => ({
      companyId: company.id,
      ownerId: company.relatedToUsers.find((relation) => relation.role === Role.OWNER).id,
      companyName: company.companyName, // Assumes this field exists in your DB
      companyImageURL: company.companyImageURL, // Optional: adjust if needed
    });

    return {
      currentCompany: currentCompany ? mapCompany(currentCompany) : null,
      companies: companies.map(relation => mapCompany(relation.company)),
    };
  }

  async deleteUserCompany(
    userId: number,
    currentCompanyId: number,
    companyId: number
  ): Promise<StatusResponseDto> {
    const deletedCompany = await this.prisma.company.findUnique({
      where: { id: companyId }
    });
  
    if (companyId === currentCompanyId || deletedCompany?.isPersonal) {
      return {
        status: StatusType.DENIED,
        description: "We can't delete your company because it is Current or Personal"
      };
    } else {
      // First, delete all related UserToCompanyRelation records
      await this.prisma.userToCompanyRelation.deleteMany({
        where: { companyId: companyId },
      });
  
      // Now, delete the company
      await this.prisma.company.delete({
        where: { id: companyId }
      });
  
      return {
        status: StatusType.SUCCESS,
        description: "We have deleted all info about this company"
      };
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

  async changeCurrentCompany(
    userId: number,
    currentCompanyId: number,
    companyId: number
  ): Promise<StatusResponseDto> {
    return {
      status: StatusType.SUCCESS,
      description: "We have changed your current company"
    }
  }

  async editCompany(
    userId: number,
    currentCompanyId: number,
    dto: EditCompanyRequestDto
  ): Promise<StatusResponseDto> {

    var description: string
    if (dto.companyId) {
      const updatedCompany = await this._updateCompany(userId, dto)
      description = `We have updated your ${updatedCompany.companyName} company`
    } else {
      const createdCompany = await this._createCompany(userId, dto);
      description = `We have created your ${createdCompany.companyName} company`
    }

    return {
      status: StatusType.SUCCESS,
      description: description
    }
  }

  // Private Methods

  async _updateCompany(
    userId: number,
    dto: EditCompanyRequestDto
  ): Promise<Company> {
    return await this.prisma.company.update({
      where: { id: dto.companyId },
      data: { companyName: dto.companyName }
    });
  }

  async _createCompany(
    userId: number,
    dto: EditCompanyRequestDto
  ): Promise<Company> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    const createdCompany = await this.prisma.company.create({
      data: {
        companyName: dto.companyName,
        isPersonal: false,
      },
    });

    await this.prisma.userToCompanyRelation.create({
      data: {
        userId: user.id,
        companyId: createdCompany.id,
        role: Role.OWNER
      },
    });

    return createdCompany;
  }
}