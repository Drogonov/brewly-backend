import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IOnboardingPageResponse, OnboardingPageResponseDto } from './onboarding.page-response.dto';

// MARK: - Project implementation

export interface IOnboardingResponse {
  pages: IOnboardingPageResponse[];
}

// MARK: - Swagger class

export class OnboardingResponseDto implements IOnboardingResponse {
  @ApiProperty({ description: 'Страницы из которых состоит Онбоардинг', type: [OnboardingPageResponseDto] })
  pages: OnboardingPageResponseDto[];
}