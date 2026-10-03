import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RemoveOptions, SaveOptions } from 'typeorm';
import { User } from '../auth/user.entity';
import { TaskStatus } from './task-status.enum';
import { TASKS_REPOSITORY, TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any, any>;
};

const mockTasksRepository = () => ({
  getTasks: jest.fn(),
  createTask: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

const mockUser: User = {
  username: 'Ravi',
  id: 'randomid',
  password: 'raviravi',
  tasks: [],
  hasId: function (): boolean {
    throw new Error('Function not implemented.');
  },
  save: function (options?: SaveOptions): Promise<User> {
    throw new Error('Function not implemented.');
  },
  remove: function (options?: RemoveOptions): Promise<User> {
    throw new Error('Function not implemented.');
  },
  softRemove: function (options?: SaveOptions): Promise<User> {
    throw new Error('Function not implemented.');
  },
  recover: function (options?: SaveOptions): Promise<User> {
    throw new Error('Function not implemented.');
  },
  reload: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
};

describe('TaskService', () => {
  let tasksService: TasksService;
  let tasksRepository: MockType<TasksRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TASKS_REPOSITORY, // use getRepositoryToken(Task) if using standard @InjectRepository
          useFactory: mockTasksRepository,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    tasksRepository = module.get(TASKS_REPOSITORY);
  });

  it('should be defined', () => {
    expect(tasksService).toBeDefined();
    expect(tasksRepository).toBeDefined();
  });

  describe('getTasks', () => {
    it('calls TasksRepository.getTasks and return the result', async () => {
      expect(tasksRepository.getTasks).not.toHaveBeenCalled();
      tasksRepository.getTasks?.mockResolvedValue('some');
      const result = await tasksService.getTasks({}, mockUser);
      expect(tasksRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('some');
    });
  });

  describe('getTasksById', () => {
    it('calls TasksRepository.findOne and return the result', async () => {
      const mockTask = {
        title: 'test',
        describe: ' desc',
        id: 'someid',
        status: TaskStatus.OPEN,
      };

      tasksRepository.findOne?.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById('someid', mockUser);
      expect(result).toEqual(mockTask);
    });

    it('calls TasksRepository.findOne and handles an error', async () => {
      tasksRepository.findOne?.mockResolvedValue(null);
      expect(tasksService.getTaskById('someid', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
