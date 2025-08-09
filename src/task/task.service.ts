import { Injectable } from '@nestjs/common';

@Injectable()
export class TaskService {
  getTasks() {
    return [
      { id: 1, task: 'HEHEHE' },
      { id: 2, task: 'HIHIHI' },
    ];
  }
}
