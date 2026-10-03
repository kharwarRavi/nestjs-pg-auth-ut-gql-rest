import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';

export const USERS_REPOSITORY = 'USERS_REPOSITORY';

export interface UsersRepository extends Repository<User> {
  createUser(authCredentialsDto: AuthCredentialsDto): Promise<void>;
}

export const createUsersRepository = (
  dataSource: DataSource,
): UsersRepository => {
  const repository = dataSource.getRepository(User);
  return repository.extend({
    async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
      const { username, password } = authCredentialsDto;

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = repository.create({
        username,
        password: hashedPassword,
      });
      try {
        await repository.save(user);
      } catch (error: unknown) {
        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          error.code === '23505'
        ) {
          throw new ConflictException('Username already exists');
        } else throw new InternalServerErrorException();
      }
    },
  }) as UsersRepository;
};
