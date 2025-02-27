import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditCompanyRequestDto {

  @ApiProperty({ example: 666 })
  @IsOptional()
  companyId?: number;

  @IsNotEmpty()
  @ApiProperty({ example: "Some Name" })
  companyName: string;
}