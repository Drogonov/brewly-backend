import { Injectable } from '@nestjs/common';
import { IOnboardingResponse } from './dto';
import { LocalizationStringsService } from 'src/app/common/localization/localization-strings.service';
import { OnboardingKeys } from 'src/app/common/localization/generated';

@Injectable()
export class OnboardingService {
    constructor(
        private readonly localizationStringsService: LocalizationStringsService
    ) { }

    async getOnboarding(): Promise<IOnboardingResponse> {
        return {
            pages: [
                {
                    pageNumber: 1,
                    subtitle: await this.localizationStringsService.getOnboardingText(OnboardingKeys.ONBOARDING_PAGE_1_SUBTITLE),
                    text: [
                        await this.localizationStringsService.getOnboardingText(OnboardingKeys.ONBOARDING_PAGE_1_TEXT_1)
                    ]
                },
                {
                    pageNumber: 2,
                    subtitle: await this.localizationStringsService.getOnboardingText(OnboardingKeys.ONBOARDING_PAGE_2_SUBTITLE),
                    text: [
                        await this.localizationStringsService.getOnboardingText(OnboardingKeys.ONBOARDING_PAGE_2_TEXT_1),
                        await this.localizationStringsService.getOnboardingText(OnboardingKeys.ONBOARDING_PAGE_2_TEXT_2),
                        await this.localizationStringsService.getOnboardingText(OnboardingKeys.ONBOARDING_PAGE_2_TEXT_3)
                    ]
                },
                {
                    pageNumber: 3,
                    subtitle: await this.localizationStringsService.getOnboardingText(OnboardingKeys.ONBOARDING_PAGE_3_SUBTITLE),
                    text: [
                        await this.localizationStringsService.getOnboardingText(OnboardingKeys.ONBOARDING_PAGE_3_TEXT_1),
                        await this.localizationStringsService.getOnboardingText(OnboardingKeys.ONBOARDING_PAGE_3_TEXT_2)
                    ]
                }
            ]
        }
    }
}