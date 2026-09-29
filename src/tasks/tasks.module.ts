import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import {
  createTasksRepository,
  TASKS_REPOSITORY,
} from './tasks.repository';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      provide: TASKS_REPOSITORY,
      inject: [DataSource],
      useFactory: createTasksRepository,
    },
  ],
})
export class TasksModule {}
