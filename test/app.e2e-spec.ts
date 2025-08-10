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

const getRandomStatus = (): TaskStatus => {
  const statuses = Object.values(TaskStatus);
  return statuses[Math.floor(Math.random() * 3)];
};

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

  for (let i = 1; i <= TASK_TOTAL_RECORD; i++) {
    tasks.push(
      taskRepo.create({
        title: `Task ${i}`,
        description: `Task ${i} Descripton`,
        status: getRandomStatus(),
      }),
    );
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

  it('/task (GET)', async () => {
    const tasks = await request(app.getHttpServer()).get('/task').expect(200);
    expect(tasks.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([expect.anything()]),
        totalRecord: TASK_TOTAL_RECORD,
      }),
    );
  });
});
