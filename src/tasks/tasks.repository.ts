import { DataSource, Repository } from 'typeorm';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';
import { InternalServerErrorException, Logger } from '@nestjs/common';

export const TASKS_REPOSITORY = 'TASKS_REPOSITORY';

export interface TasksRepository extends Repository<Task> {
  createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task>;
  getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]>;
}

export function createTasksRepository(dataSource: DataSource): TasksRepository {
  const logger = new Logger('TasksRepository', { timestamp: true });
  const repository = dataSource.getRepository(Task);

  return repository.extend({
    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
      const { title, description } = createTaskDto;
      try {
        const task = repository.create({
          title,
          description,
          status: TaskStatus.OPEN,
          user,
        });

        const savedTask = await repository.save(task);
        logger.debug(`Task created successfully with ID: ${savedTask.id}`);
        return savedTask;
      } catch (error: unknown) {
        logger.error(
          `Failed to create task for user "${user.id}". Data: ${JSON.stringify(createTaskDto)}`,
          error instanceof Error ? error.stack : undefined,
        );
        throw new InternalServerErrorException();
      }
    },

    async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
      const { status, search } = filterDto;
      const query = repository.createQueryBuilder('task');
      query.where({ user });

      if (status) {
        query.andWhere('task.status = :status', { status });
      }

      if (search) {
        query.andWhere(
          '((LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)))',
          { search: `%${search}%` },
        );
      }

      try {
        const tasks = await query.getMany();
        logger.debug(`User "${user.id}" retrieved ${tasks.length} task(s).`);
        return tasks;
      } catch (error: unknown) {
        logger.error(
          `Failed to get tasks for user "${user.id}". Filters: ${JSON.stringify(filterDto)}`,
          error instanceof Error ? error.stack : undefined,
        );
        throw new InternalServerErrorException();
      }
    },
  }) as TasksRepository;
}
