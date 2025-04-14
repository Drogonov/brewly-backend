import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IOptionListResponse } from 'src/app.common/dto/option-list.response.dto';

// MARK: - Project implementation

export interface ISampleTypeInfoResponse {
  sampleTypeId: number,
  companyName: string;
  sampleName: string;
  beanOrigin?: IOptionListResponse;
  procecingMethod?: IOptionListResponse;
  roastType?: number;
  grindType?: number;
  labels?: string[]
  packsInWarehouseDescription?: string
  isArchived: boolean;
}

// MARK: - Swagger class

export class SampleTypeInfoResponseDto implements ISampleTypeInfoResponse {
  @ApiProperty({ example: 666 })
  sampleTypeId: number;

  @ApiProperty({ example: 'Tasty Coffee' })
  companyName: string;

  @ApiProperty({ example: 'Irgachiff 4' })
  sampleName: string;

  @ApiPropertyOptional({ example: 'Blend' })
  beanOrigin?: IOptionListResponse;

  @ApiPropertyOptional({ example: 'Washed' })
  procecingMethod?: IOptionListResponse;

  @ApiPropertyOptional({ example: 9 })
  grindType?: number;

  @ApiPropertyOptional({ example: ['Decaf', 'Microlot'] })
  labels?: string[];

  @ApiPropertyOptional({ description: "range from 1 to 5 of roast value", example: 1 })
  roastType?: number;

  @ApiProperty({ example: false })
  isArchived: boolean;
}