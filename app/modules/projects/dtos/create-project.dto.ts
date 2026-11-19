import { STATUS } from '@/common/enums/status.enum';
import { PROJECT_STATUS } from '@/entities/project/enums/project-status.enum';
import { PLATFORM_TYPE } from '@/entities/project/enums/type.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(PLATFORM_TYPE)
  @IsNotEmpty()
  platformType!: PLATFORM_TYPE;

  @IsEnum(PROJECT_STATUS)
  @IsNotEmpty()
  projectStatus!: PROJECT_STATUS;

  @IsEnum(STATUS)
  @IsNotEmpty()
  status!: STATUS;
}
