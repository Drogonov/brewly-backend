import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// MARK: - Project implementation

export interface ISampleTypeInfoResponse {
  sampleTypeId: number,
  companyName: string;
  sampleName: string;
  roastType: number;
  coffeeType: string;
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

  @ApiProperty({ description: "range from 1 to 5 of roast value", example: 1 })
  roastType: number;

  @ApiProperty({ example: 'Blend' })
  coffeeType: string;

  @ApiProperty({ description: "String value with comment about amount of availiable packs at warehouse", example: "2 packs of 250g and 1 pack of 1000g" })
  packsInWarehouseDescription?: string
}