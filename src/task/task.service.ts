import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskReposity: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const createdTask = this.taskReposity.create(createTaskDto);

    return await this.taskReposity.save(createdTask);
  }

  async findAll() {
    return await this.taskReposity.find();
  }

  async findOne(id: number) {
    const task = await this.taskReposity.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not exist');
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskDto);

    return await this.taskReposity.save(task);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.taskReposity.delete({ id });
  }
}
