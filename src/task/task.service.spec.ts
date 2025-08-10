import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { FindTaskDTO } from './dto/find-task.dto';
import { TaskStatus } from '../common/enum/task.enum';

const taskOne = {
  id: 1,
  title: 'Task 1',
  description: 'This is task 1 description',
  status: 'TO_DO',
  createdAt: '2025-08-09 15:02:15.526926',
  updatedAt: null,
};
const taskOneId = 1;
const notExistId = 99;

const taskArray = [
  taskOne,
  {
    id: 2,
    title: 'Task 2',
    description: 'This is task 2 description',
    status: 'IN_PROGRESS',
    createdAt: '2025-08-09 15:02:15.526926',
    updatedAt: null,
  },
  {
    id: 3,
    title: 'Task 3',
    description: 'This is task 3 description',
    status: 'DONE',
    createdAt: '2025-08-09 15:02:15.526926',
    updatedAt: null,
  },
];

describe('TaskService', () => {
  let service: TaskService;
  let repo: Repository<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            findAndCount: jest
              .fn()
              .mockResolvedValue([taskArray, taskArray.length]),
            findOne: jest.fn().mockResolvedValue(taskOne),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    repo = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('findOne', () => {
    it('should get a single task by id', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      await expect(service.findOne(taskOneId)).resolves.toEqual(taskOne);
      expect(repoSpy).toHaveBeenCalledWith({ where: { id: taskOneId } });
    });
    it('should throw not found exception if task not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(notExistId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    const defaultLimit = 10;
    const defaultOffset = 0;
    it('should use default pagination if page or limit are not provided', async () => {
      const findTaskDto = {};
      const repoSpy = jest.spyOn(repo, 'findAndCount');
      await expect(service.findAll(findTaskDto)).resolves.toEqual({
        data: taskArray,
        totalRecord: taskArray.length,
      });
      expect(repoSpy).toHaveBeenCalledWith({
        take: defaultLimit,
        skip: defaultOffset,
      });
    });
    it('should use filter and pagination if provided', async () => {
      const findTaskDto: FindTaskDTO = {
        limit: 5,
        page: 1,
        status: TaskStatus.TODO,
      };
      const repoSpy = jest.spyOn(repo, 'findAndCount');

      await expect(service.findAll(findTaskDto)).resolves.toEqual({
        data: taskArray,
        totalRecord: taskArray.length,
      });
      expect(repoSpy).toHaveBeenCalledWith({
        take: findTaskDto.limit,
        skip: 0,
        where: { status: findTaskDto.status },
      });
    });
  });

  describe('update', () => {
    it('should update task with id and return updated task', async () => {
      const updateTaskDto = { status: TaskStatus.INPROGRES };
      const updatedTask = {
        ...taskOne,
        ...updateTaskDto,
        updatedAt: new Date(),
        createdAt: new Date(taskOne.createdAt), // handle type issue
      };
      const repoSpy = jest.spyOn(repo, 'save');
      repoSpy.mockResolvedValueOnce(updatedTask);
      await expect(service.update(taskOneId, updateTaskDto)).resolves.toEqual(
        updatedTask,
      );
      expect(repoSpy).toHaveBeenCalledWith({ ...taskOne, ...updateTaskDto });
    });
  });
  describe('delete', () => {
    it('should delete task with id and return nothing', async () => {
      const repoSpy = jest.spyOn(repo, 'delete');
      await expect(service.remove(taskOneId)).resolves.toBeUndefined();
      expect(repoSpy).toHaveBeenCalledWith({ id: taskOneId });
    });
  });
});
