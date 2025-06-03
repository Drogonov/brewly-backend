import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/app.common/services/prisma/prisma.service';
import {
  EditCompanyRequestDto,
  IGetCompanyDataResponse,
  IGetUserCompaniesResponse,
  StatusResponseDto,
  StatusType
} from './dto';
import { Company, Role, TeamInvitationType } from '@prisma/client';
import { MappingService } from 'src/app.common/services/mapping.service';
import { CompanyRulesService } from 'src/app.common/services/company-rules.service';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings.service';
import { BusinessErrorKeys, CompanyKeys, ErrorsKeys } from 'src/app.common/localization/generated';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private mappingService: MappingService,
    private companyRulesService: CompanyRulesService,
    private errorHandlingService: ErrorHandlingService,
    private localizationStringsService: LocalizationStringsService
  ) { }

  async getUserCompanies(
    userId: number,
    currentCompanyId: number,
  ): Promise<IGetUserCompaniesResponse> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  async deleteUserCompany(
    userId: number,
    currentCompanyId: number,
    companyId: number
  ): Promise<StatusResponseDto> {
    try {
      const deletedCompany = await this.prisma.company.findUnique({
        where: { id: companyId },
      });

      // Prevent deletion if the company is the current one or a personal company.
      if (companyId === currentCompanyId || deletedCompany?.isPersonal) {
        throw await this.errorHandlingService.getBusinessError(BusinessErrorKeys.COMPANY_DELETE_DENIED);
      }

      await this.prisma.userToCompanyRelation.deleteMany({
        where: { companyId: companyId },
      });
      await this.prisma.companyRule.deleteMany({
        where: { companyId: companyId }
      })
      await this.prisma.company.delete({
        where: { id: companyId },
      });

      return {
        status: StatusType.SUCCESS,
        description: await this.localizationStringsService.getCompanyText(CompanyKeys.DELETE_USER_COMPANY_SUCCESS),
      };
    } catch (error) {
      throw error;
    }
  }

  async getCompanyData(
    userId: number,
    currentCompanyId: number,
    companyId: number
  ): Promise<IGetCompanyDataResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          currentCompany: {
            include: { relatedToUsers: true, teamInvitations: true },
          },
        },
      });
      if (!user) {
        throw await this.errorHandlingService.getForbiddenError(ErrorsKeys.SESSION_EXPIRED);
      }

      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
        include: { relatedToUsers: true },
      });
      if (!company) {
        throw await this.errorHandlingService.getBusinessError(BusinessErrorKeys.COMPANY_NOT_FOUND);
      }

      const relatedTeam = await this.prisma.userToCompanyRelation.findMany({
        where: { companyId: companyId },
        include: { user: true },
      });

      return {
        companyInfo: this.mappingService.mapCompany(company),
        team: relatedTeam.map((relation) =>
          this.mappingService.mapUser(
            relation.user,
            this.mappingService.mapRole(relation.role),
          ),
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  async changeCurrentCompany(
    userId: number,
    currentCompanyId: number,
    companyId: number
  ): Promise<StatusResponseDto> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          currentCompany: { connect: { id: companyId } },
        },
      });

      return {
        status: StatusType.SUCCESS,
        description: await this.localizationStringsService.getCompanyText(CompanyKeys.CHANGE_CURRENT_COMPANY_SUCCESS),
      };
    } catch (error) {
      throw error;
    }
  }

  async editCompany(
    userId: number,
    currentCompanyId: number,
    dto: EditCompanyRequestDto
  ): Promise<StatusResponseDto> {
    try {
      let description: string;
      if (dto.companyId) {
        const updatedCompany = await this.updateCompany(userId, dto);
        description = await this.localizationStringsService.getCompanyText(
          CompanyKeys.EDIT_COMPANY_UPDATE_SUCCESS,
          { companyName: updatedCompany }
        );
      } else {
        const createdCompany = await this.createCompany(userId, dto);
        description = await this.localizationStringsService.getCompanyText(
          CompanyKeys.EDIT_COMPANY_CREATE_SUCCESS,
          { companyName: createdCompany }
        );
      }

      return {
        status: StatusType.SUCCESS,
        description,
      };
    } catch (error) {
      throw error;
    }
  }

  async acceptTeamInvitation(
    userId: number,
    notificationId: number
  ): Promise<StatusResponseDto> {
    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { id: notificationId },
      include: { company: true },
    });

    let description: string
    if (invitation.type !== TeamInvitationType.REQUEST && invitation.type !== TeamInvitationType.TEAM) {
      description = await this.localizationStringsService.getCompanyText(
        CompanyKeys.TEAM_INVITATION_ALREADY_ACCEPTED
      );
      return { status: StatusType.DENIED, description };
    }

    if (!invitation || invitation.receiverId !== userId) {
      throw await this.errorHandlingService.getBusinessError(BusinessErrorKeys.NOTIFICATION_NOT_FOUND);
    }

    await this.prisma.teamInvitation.update({
      where: { id: notificationId },
      data: { type: TeamInvitationType.TEAM },
    });

    const existing = await this.prisma.userToCompanyRelation.findUnique({
      where: { userId_companyId: { userId, companyId: invitation.companyId } },
    });
    if (!existing) {
      await this.prisma.userToCompanyRelation.create({
        data: {
          userId,
          companyId: invitation.companyId,
          role: Role.BARISTA,
        },
      });
    }

    description = await this.localizationStringsService.getCompanyText(
      CompanyKeys.TEAM_INVITATION_ACCEPTED
    );
    return { status: StatusType.SUCCESS, description };
  }

  // Private Methods

  private async updateCompany(
    userId: number,
    dto: EditCompanyRequestDto
  ): Promise<Company> {
    try {
      return await this.prisma.company.update({
        where: { id: dto.companyId },
        data: { companyName: dto.companyName },
      });
    } catch (error) {
      throw error;
    }
  }

  private async createCompany(
    userId: number,
    dto: EditCompanyRequestDto
  ): Promise<Company> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw await this.errorHandlingService.getForbiddenError(ErrorsKeys.SESSION_EXPIRED);
      }

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
    } catch (error) {
      throw error;
    }
  }
}