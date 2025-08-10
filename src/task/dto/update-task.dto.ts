import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { TaskStatus } from '../../common/enum/task.enum';
import { IsEnum, IsOptional, MaxLength } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @MaxLength(255)
  title?: string | undefined;

  description?: string | undefined;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus | undefined;
}
