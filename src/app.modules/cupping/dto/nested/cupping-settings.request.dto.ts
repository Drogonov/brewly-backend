import { IsNotEmpty, IsString, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BooleanTransformer } from 'src/app.common/decorators';

export class CuppingSettingsRequestDto {
  @IsNotEmpty()
  @ApiProperty({ example: "Cupping 123" })
  cuppingName: string

  @IsNotEmpty()
  @BooleanTransformer()
  @IsBoolean()
  @ApiProperty({ example: true })
  randomSamplesOrder: boolean

  @IsNotEmpty()
  @BooleanTransformer()
  @IsBoolean()
  @ApiProperty({ example: true })
  openSampleNameCupping: boolean

  @IsNotEmpty()
  @BooleanTransformer()
  @IsBoolean()
  @ApiProperty({ example: true })
  singleUserCupping: boolean

  @IsNotEmpty()
  @BooleanTransformer()
  @IsBoolean()
  @ApiProperty({ example: true })
  inviteAllTeammates: boolean
}