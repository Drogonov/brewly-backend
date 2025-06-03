import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestType } from '../types/test-type.enum';

// MARK: - Project implementation

export interface IGetCuppingSampleTest {
    type: TestType;
    intensivityUserRate?: number;
    intensivityAverageRate?: number;
    intensivityChiefRate?: number;

    qualityUserRate?: number;
    qualityAverageRate?: number;
    qualityChiefRate?: number;

    commentUser?: string;
    commentUsers?: string[];
}

// MARK: - Swagger class

export class GetCuppingSampleTestDto implements IGetCuppingSampleTest {

    @ApiProperty({ description: 'Test type' })
    type: TestType;

    @ApiProperty({ description: 'Rate of the user' })
    intensivityUserRate?: number;

    @ApiProperty({ description: 'Average Rate of the test' })
    intensivityAverageRate?: number;

    @ApiProperty({ description: 'Chief Rate of the test' })
    intensivityChiefRate?: number;

    @ApiProperty({ description: 'Rate of the user' })
    qualityUserRate?: number;

    @ApiProperty({ description: 'Average Rate of the test' })
    qualityAverageRate?: number;

    @ApiProperty({ description: 'Chief Rate of the test' })
    qualityChiefRate?: number;

    @ApiProperty({ description: 'Comment left by user' })
    commentUser?: string;

    @ApiProperty({ description: 'Comments left by other users' })
    commentUsers?: string[];
}