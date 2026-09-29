import { DataSource, Repository } from 'typeorm';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';

export const TASKS_REPOSITORY = 'TASKS_REPOSITORY';

export interface TasksRepository extends Repository<Task> {
	createTask(createTaskDto: CreateTaskDto): Promise<Task>;
	getTasks(filterDto: GetTasksFilterDto): Promise<Task[]>;
}

export function createTasksRepository(dataSource: DataSource): TasksRepository {
	const repository = dataSource.getRepository(Task);

 	return repository.extend({
		async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
			const { title, description } = createTaskDto;
			const task = repository.create({
				title,
				description,
				status: TaskStatus.OPEN,
			});

 			return repository.save(task);
		},

		async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
			const { status, search } = filterDto;
			const query = repository.createQueryBuilder('task');

			if (status) {
				query.andWhere('task.status = :status', { status });
			}

			if (search) {
				query.andWhere(
					'(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
					{ search: `%${search}%` },
				);
			}

			return query.getMany();
		},
	}) as TasksRepository;
}
