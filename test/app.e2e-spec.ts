/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { Task } from '../src/task/entities/task.entity';
import { newDb } from 'pg-mem';
import { DataSource } from 'typeorm';
import { TaskStatus } from '../src/common/enum/task.enum';

const TASK_TOTAL_RECORD = 12;

const setupDataSource = async () => {
  const db = newDb();

  db.public.registerFunction({
    implementation: () => 'test',
    name: 'current_database',
  });

  db.public.registerFunction({
    name: 'version',
    implementation: () => 'Im not sure about PostgreSQL version',
  });

  const ds: DataSource = await db.adapters.createTypeormDataSource({
    type: 'postgres',
    entities: [Task],
  });

  await ds.initialize();
  await ds.synchronize();

  const taskRepo = ds.getRepository(Task);
  const tasks: Task[] = [];
  const statuses = Object.values(TaskStatus);
  let statusIdx = 0;

  for (let i = 1; i <= TASK_TOTAL_RECORD; i++) {
    tasks.push(
      taskRepo.create({
        title: `Task ${i}`,
        description: `Task ${i} Descripton`,
        status: statuses[statusIdx],
      }),
    );
    statusIdx++;
    if (statusIdx > 2) statusIdx = 0;
  }
  await taskRepo.save(tasks);

  return ds;
};

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const dataSource = await setupDataSource();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/task (GET)', () => {
    interface GetTaskResponse {
      data: Task[];
      totalRecord: number; // 'totalRecord' is the number of filtered tasks
    }

    it('Without query', async () => {
      const tasks = await request(app.getHttpServer()).get('/task').expect(200);
      expect(tasks.body).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([expect.anything()]),
          totalRecord: TASK_TOTAL_RECORD,
        }),
      );
    });

    it('with status filter', async () => {
      const filteredTasksLength = 4;
      const queryDto = {
        status: 'IN_PROGRESS',
      };
      const tasks = await request(app.getHttpServer())
        .get('/task')
        .query(queryDto)
        .expect(200);
      expect(tasks.body).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([expect.anything()]),
          totalRecord: filteredTasksLength,
        }),
      );
      expect((tasks.body as GetTaskResponse).data.length).toBe(
        filteredTasksLength,
      );
    });
    it('with limit', async () => {
      const queryDto = {
        limit: 5,
      };
      const tasks = await request(app.getHttpServer())
        .get('/task')
        .query(queryDto)
        .expect(200);
      expect(tasks.body).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([expect.anything()]),
          totalRecord: TASK_TOTAL_RECORD,
        }),
      );
      expect((tasks.body as GetTaskResponse).data.length).toBe(queryDto.limit);
    });
    it('with page and limit', async () => {
      const queryDto = {
        limit: 5,
        page: 3,
      };
      const tasks = await request(app.getHttpServer())
        .get('/task')
        .query(queryDto)
        .expect(200);
      expect(tasks.body).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([expect.anything()]),
          totalRecord: TASK_TOTAL_RECORD,
        }),
      );
      const restOfDataLength =
        TASK_TOTAL_RECORD - queryDto.limit * (queryDto.page - 1);
      expect((tasks.body as GetTaskResponse).data.length).toBe(
        restOfDataLength,
      );
    });
  });
});
