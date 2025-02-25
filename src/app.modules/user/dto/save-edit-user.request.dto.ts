import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveEditUserRequest {

  @ApiProperty({ example: "Jon Wayne" })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ example: "test@test.com" })
  email: string;

  @ApiProperty({ example: "Some Info" })
  @IsString()
  @IsOptional()
  about?: string;
}