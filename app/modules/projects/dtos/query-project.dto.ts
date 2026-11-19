import { STATUS } from '@/common/enums/status.enum';
import { PROJECT_STATUS } from '@/entities/project/enums/project-status.enum';
import { PLATFORM_TYPE } from '@/entities/project/enums/type.enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class QueryProjectDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(PLATFORM_TYPE)
  @IsOptional()
  platformType?: PLATFORM_TYPE;

  @IsEnum(PROJECT_STATUS)
  @IsOptional()
  projectStatus?: PROJECT_STATUS;

  @IsEnum(STATUS)
  @IsOptional()
  status?: STATUS;
}
