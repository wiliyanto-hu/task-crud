import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  description: string;
}
