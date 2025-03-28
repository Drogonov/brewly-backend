import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ISampleTypeInfoResponse {
  sampleTypeId: number,
  companyName: string;
  sampleName: string;
  beanOrigin?: BeanOrigin;
  procecingMethod?: ProcessingMethod;
  roastType?: number;
  grindType?: number;
  labels?: [string]
  packsInWarehouseDescription?: string
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
  beanOrigin?: BeanOrigin;

  @ApiPropertyOptional({ example: 'Washed' })
  procecingMethod?: ProcessingMethod;

  @ApiPropertyOptional({ example: 9 })
  grindType?: number;

  @ApiPropertyOptional({ example: ['Decaf', 'Microlot'] })
  labels?: [string];

  @ApiPropertyOptional({ description: "range from 1 to 5 of roast value", example: 1 })
  roastType?: number;

  @ApiPropertyOptional({ description: "String value with comment about amount of availiable packs at warehouse", example: "2 packs of 250g and 1 pack of 1000g" })
  packsInWarehouseDescription?: string
}

export enum BeanOrigin {
  Mono = "Mono",
  Blend = "Blend"
}

export enum ProcessingMethod {
  Washed = 'Washed',
  Natural = 'Natural',
  Honey = 'Honey',
  Experimental = 'Experimental',
}