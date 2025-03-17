import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IOnboardingPageResponse {
  title: string;
  text: string;
  imageURL?: string;
  buttonText?: string;
}

export class OnboardingPageResponseDto implements IOnboardingPageResponse {
  @ApiProperty({ example: 'Onboarding 1' })
  title: string;

  @ApiProperty({ example: 'Текст Онбоардинга' })
  text: string;

  @ApiPropertyOptional({ example: 'https://brewly.digital/images/1' })
  imageURL?: string;

  @ApiPropertyOptional({ example: 'Lets go' })
  buttonText?: string;
}