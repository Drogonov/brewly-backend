import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface IOnboardingPageResponse {
    title: string;
    text: string;
    imageURL?: URL
    buttonText?: string;
}

// MARK: - Swagger class

export class OnboardingPageResponseDto implements IOnboardingPageResponse {
    @ApiProperty({ example: 'Onboarding 1' })
    title: string;

    @ApiProperty({ example: 'Текст Онбоардинга' })
    text: string;

    @ApiPropertyOptional({ example: 'hhtps://brewly.digital/images/1' })
    imageURL?: URL;

    @ApiPropertyOptional({ example: 'Lets go' })
    buttonText?: string;
}