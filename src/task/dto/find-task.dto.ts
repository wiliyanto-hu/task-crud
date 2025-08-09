import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive, Min, isEnum } from 'class-validator';
import { TaskStatus } from 'src/common/enum/task.enum';

export class FindTaskDTO {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
