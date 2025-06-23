import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/app/common/services/prisma/prisma.service';
import { CompanyRuleType, Role } from '@prisma/client';

@Injectable()
export class CompanyRulesService {
  constructor(private prisma: PrismaService) {}

  async createDefaultCompanyRules(companyId: number): Promise<void> {
    const defaultRules = [
      {
        name: "Am I Chief",
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
      })),
    });
  }

  async shouldShowMakeChiefAction(companyId: number): Promise<boolean> {
    const rule = await this.prisma.companyRule.findFirst({
      where: {
        companyId,
        companyRuleType: CompanyRuleType.canChiefMakeChief,
      },
    });
    return rule ? rule.value : false;
  }
}