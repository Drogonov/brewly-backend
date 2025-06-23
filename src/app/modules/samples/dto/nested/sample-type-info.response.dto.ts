import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IOptionListResponse, OptionListResponseDto } from 'src/app/common/dto/option-list.response.dto';
import { CoffeePackInfoResponseDto, ICoffeePackInfoResponse } from './coffee-pack-info.response.dto';
import { Type } from 'class-transformer';

// MARK: - Project implementation

export interface ISampleTypeInfoResponse {
  sampleTypeId: number,
  companyName: string;
  sampleName: string;
  beanOrigin?: IOptionListResponse;
  procecingMethod?: IOptionListResponse;
  roastType?: number;
  grindType?: number;
  labels?: string[];
  packsInWarehouseDescription?: string;
  connectedPacksInfo?: ICoffeePackInfoResponse[];
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

  @ApiPropertyOptional({
    description: 'Bean origin as an option list',
    type: () => OptionListResponseDto,
  })
  @Type(() => OptionListResponseDto)
  beanOrigin?: OptionListResponseDto;

  @ApiPropertyOptional({
    description: 'Processing method as an option list',
    type: () => OptionListResponseDto,
  })
  @Type(() => OptionListResponseDto)
  procecingMethod?: OptionListResponseDto;

  @ApiPropertyOptional({ example: 9, type: Number })
  roastType?: number;

  @ApiPropertyOptional({ example: 7, type: Number })
  grindType?: number;

  @ApiPropertyOptional({
    example: ['Decaf', 'Microlot'],
    type: () => String,
    isArray: true
  })
  labels?: string[];

  @ApiPropertyOptional({ description: 'Description of packs in warehouse', example: '1 pack 250g', type: String })
  packsInWarehouseDescription?: string;

  @ApiPropertyOptional({
    description: 'Array of connected coffee pack info',
    type: () => CoffeePackInfoResponseDto,
    isArray: true,
  })
  @Type(() => CoffeePackInfoResponseDto)
  connectedPacksInfo?: CoffeePackInfoResponseDto[];

  @ApiProperty({ example: false, type: Boolean })
  isArchived: boolean;
}