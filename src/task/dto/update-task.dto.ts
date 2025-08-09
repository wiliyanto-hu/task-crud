import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { TaskStatus } from 'src/common/enum/task.enum';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  title?: string | undefined;
  description?: string | undefined;
  status?: TaskStatus | undefined;
}
