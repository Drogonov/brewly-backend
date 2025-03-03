import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class EditCompanyRequestDto {

  @ApiProperty({ example: 666 })
  @IsOptional()
  @Type(() => Number)
  companyId?: number;

  @IsNotEmpty()
  @ApiProperty({ example: "Some Name" })
  companyName: string;
}