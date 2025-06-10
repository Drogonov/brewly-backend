import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IOnboardingPageResponse {
  pageNumber: number;
  subtitle: string;
  text: string[];
}

export class OnboardingPageResponseDto implements IOnboardingPageResponse {

  @ApiProperty({ example: 'Page number' })
  pageNumber: number;

  @ApiProperty({ example: 'Subtitle for the text' })
  subtitle: string;

  @ApiProperty({ example: 'Text options' })
  text: string[];
}