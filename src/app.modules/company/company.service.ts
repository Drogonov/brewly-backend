import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/app.services/prisma/prisma.service';
import {
  EditCompanyRequestDto,
  IGetCompanyDataResponse,
  IGetUserCompaniesResponse,
  StatusResponseDto,
  StatusType
} from './dto';
import { Company, Role } from '@prisma/client';
import { MappingService } from 'src/app.services/services/mapping.service';
import { CompanyRulesService } from 'src/app.services/services/company-rules.service';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private mappingService: MappingService,
    private companyRulesService: CompanyRulesService
  ) { }

  async getUserCompanies(
    userId: number,
    currentCompanyId: number,
  ): Promise<IGetUserCompaniesResponse> {
    const relations = await this.prisma.userToCompanyRelation.findMany({
      where: { userId },
      include: { company: { include: { relatedToUsers: true } } },
    });

    const currentRelation = relations.find(
      (relation) => relation.companyId === currentCompanyId,
    );
    const currentCompany = currentRelation?.company;
    const otherCompanies = relations.filter(
      (relation) => relation.companyId !== currentCompanyId,
    );

    return {
      currentCompany: currentCompany
        ? this.mappingService.mapCompany(currentCompany)
        : null,
      companies: otherCompanies.map((relation) =>
        this.mappingService.mapCompany(relation.company),
      ),
    };
  }

  async deleteUserCompany(
    userId: number,
    currentCompanyId: number,
    companyId: number
  ): Promise<StatusResponseDto> {
    const deletedCompany = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (companyId === currentCompanyId || deletedCompany?.isPersonal) {
      return {
        status: StatusType.DENIED,
        description: "We can't delete your company because it is Current or Personal",
      };
    } else {
      await this.prisma.userToCompanyRelation.deleteMany({
        where: { companyId: companyId },
      });
      await this.prisma.company.delete({
        where: { id: companyId },
      });
      return {
        status: StatusType.SUCCESS,
        description: "We have deleted all info about this company",
      };
    }
  }

  async getCompanyData(
    userId: number,
    currentCompanyId: number,
    companyId: number
  ): Promise<IGetCompanyDataResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { currentCompany: { include: { relatedToUsers: true, teamInvitations: true } } },
    });
    const currentCompany = user.currentCompany;

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { relatedToUsers: true },
    });

    const relatedTeam = await this.prisma.userToCompanyRelation.findMany({
      where: { companyId: companyId },
      include: { user: true },
    });

    return {
      companyInfo: this.mappingService.mapCompany(company),
      team: relatedTeam.map((relation) =>
        this.mappingService.mapUser(relation.user, this.mappingService.mapRole(relation.role)),
      ),
    };
  }

  async changeCurrentCompany(
    userId: number,
    currentCompanyId: number,
    companyId: number
  ): Promise<StatusResponseDto> {
    console.log(currentCompanyId);
    console.log(companyId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        currentCompany: { connect: { id: companyId } },
      },
    });

    return {
      status: StatusType.SUCCESS,
      description: "We have changed your current company",
    };
  }

  async editCompany(
    userId: number,
    currentCompanyId: number,
    dto: EditCompanyRequestDto
  ): Promise<StatusResponseDto> {
    let description: string;
    if (dto.companyId) {
      const updatedCompany = await this._updateCompany(userId, dto);
      description = `We have updated your ${updatedCompany.companyName} company`;
    } else {
      const createdCompany = await this._createCompany(userId, dto);
      description = `We have created your ${createdCompany.companyName} company`;
    }

    return {
      status: StatusType.SUCCESS,
      description: description,
    };
  }

  // Private Methods

  async _updateCompany(
    userId: number,
    dto: EditCompanyRequestDto
  ): Promise<Company> {
    return await this.prisma.company.update({
      where: { id: dto.companyId },
      data: { companyName: dto.companyName },
    });
  }

  async _createCompany(
    userId: number,
    dto: EditCompanyRequestDto
  ): Promise<Company> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
        role: Role.OWNER,
      },
    });

    await this.companyRulesService.createDefaultCompanyRules(createdCompany.id);

    return createdCompany;
  }
}