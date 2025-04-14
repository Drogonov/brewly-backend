import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SampleTypeRequestDto } from './nested/sample-type.request.dto';
import { CoffeePackRequestDto } from './nested/coffee-pack.request.dto';
import { Type } from 'class-transformer';
import { BooleanTransformer } from 'src/app.common/decorators';

export class ArchiveSampleDto {
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({ description: 'Id of the sample' })
  sampleTypeId: number;

  @IsNotEmpty()
  @BooleanTransformer()
  @ApiProperty({ example: 'Current coffee packs of that sample type' })
  isArchived: boolean;
}