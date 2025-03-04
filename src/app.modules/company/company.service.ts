import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/app.services/prisma/prisma.service';
import {
  EditCompanyRequestDto,
  IGetCompanyDataResponse,
  IGetUserCompaniesResponse,
  StatusResponseDto,
  StatusType,
  ICompanyInfoResponse,
  UserRole,
  IUserInfoResponse
} from './dto';
import { Company, CompanyRuleType, Role, User } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
  ) { }

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
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        currentCompany: {
          include: { relatedToUsers: true, teamInvitations: true }
        }
      }
    });
    const currentCompany = user.currentCompany;

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { relatedToUsers: true }
    });

    const relatedTeam = await this.prisma.userToCompanyRelation.findMany({
      where: { companyId: companyId },
      include: { user: true }
    })

    const mapRole = (role: Role): UserRole => {
      switch (role) {
        case Role.OWNER:
          return UserRole.owner;
        case Role.CHIEF:
          return UserRole.chief;
        case Role.BARISTA:
          return UserRole.barista;
        default:
          throw new Error(`Unhandled role: ${role}`);
      }
    };

    const mapCompanyInfo = (company: any): ICompanyInfoResponse => ({
      companyId: company.id,
      ownerId: company.relatedToUsers.find((relation) => relation.role === Role.OWNER).id,
      companyName: company.companyName,
      companyImageURL: company.companyImageURL
    })

    const mapUser = (user: User): IUserInfoResponse => ({
      userId: user.id,
      userName: user.userName,
      userImageURL: user.userImageURL,
      email: user.email,
      role: mapRole(currentCompany.relatedToUsers.find((relation) => relation.userId == userId).role),
      about: user.about
    });

    return {
      companyInfo: mapCompanyInfo(company),
      team: relatedTeam.map((relation) => mapUser(relation.user))
    }
  }

  async changeCurrentCompany(
    userId: number,
    currentCompanyId: number,
    companyId: number
  ): Promise<StatusResponseDto> {

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        currentCompany: { connect: { id: companyId } },
      }
    });

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

    await this._createDefaultCompanyRules(createdCompany.id)

    return createdCompany;
  }

  async _createDefaultCompanyRules(companyId: number): Promise<void> {
    const defaultRules = [
      {
        name: "Am i Chief",
        value: false,
        companyRuleType: CompanyRuleType.isOwnerChief,
        ruleForRole: Role.OWNER,
      },
      {
        name: "Can Chief Make Chief",
        value: false,
        companyRuleType: CompanyRuleType.canChiefMakeChief,
        ruleForRole: Role.CHIEF,
      },
      {
        name: "Can Chief invite User",
        value: false,
        companyRuleType: CompanyRuleType.canChiefInviteUser,
        ruleForRole: Role.CHIEF,
      },
      {
        name: "Can Chief create cupping",
        value: false,
        companyRuleType: CompanyRuleType.canChiefCreateCupping,
        ruleForRole: Role.CHIEF,
      },
      {
        name: "Is Chief rates preferred",
        value: false,
        companyRuleType: CompanyRuleType.isChiefRatesPreferred,
        ruleForRole: Role.CHIEF,
      },
      {
        name: "Can Barista invite users",
        value: false,
        companyRuleType: CompanyRuleType.canBaristaInviteUsers,
        ruleForRole: Role.BARISTA,
      },
      {
        name: "Can Barista create cupping",
        value: false,
        companyRuleType: CompanyRuleType.canBaristaCreateCupping,
        ruleForRole: Role.BARISTA,
      },
    ];

    await this.prisma.companyRule.createMany({
      data: defaultRules.map(rule => ({
        name: rule.name,
        value: rule.value,
        companyId,
        companyRuleType: rule.companyRuleType,
        ruleForRole: rule.ruleForRole,
      }))
    });
  }
}