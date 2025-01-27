import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCuppingRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({ description: 'The users email', example: 'test@test.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'The users password', example: 'qqqqqqqq' })
  password: string;
}