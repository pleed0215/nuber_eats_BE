import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async createUser({
    email,
    role,
    password,
  }: CreateUserInput): Promise<CreateUserOutput> {
    try {
      const exist = await this.users.findOne({ email });
      if (exist) {
        return {
          ok: false,
          error: 'The email address is arleady exist. Use another please.',
          data: null,
        };
      } else {
        const newUser = this.users.create({ email, password, role });
        await this.users.save(newUser);
        return {
          ok: true,
          error: '',
          data: newUser,
        };
      }
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        data: null,
        error: 'An error occured when creating a user accound.',
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({ email });

      if (user) {
        if (await user.checkPassword(password)) {
          return {
            ok: true,
            error: '',
            token: 'correct',
          };
        } else {
          return {
            ok: false,
            error: 'Your password is wrong!',
            token: 'wrong!',
          };
        }
      } else {
        return {
          ok: false,
          error: `Cannot find user email: ${email} in users.service.ts`,
          token: '',
        };
      }
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'Login failed. This is from login method of users.service.ts',
        token: '',
      };
    }
  }
}
