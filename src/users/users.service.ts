import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import {
  UpdateProfileInput,
  UpdateProfileOutput,
} from './dtos/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // createUser
  // 1. find with email whether user eixst.
  // 2. if user exist, return fail or create user.
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
        };
      } else {
        const newUser = this.users.create({ email, password, role });
        await this.users.save(newUser);
        return {
          ok: true,
          data: newUser,
        };
      }
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'An error occured when creating a user accound.',
      };
    }
  }

  // login
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({ email });

      if (user) {
        if (await user.checkPassword(password)) {
          const token = this.jwtService.sign(user.id);
          return {
            ok: true,
            token,
          };
        } else {
          return {
            ok: false,
            error: 'Your password is wrong!',
          };
        }
      } else {
        return {
          ok: false,
          error: `Cannot find user email: ${email} in users.service.ts`,
        };
      }
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'Login failed. This is from login method of users.service.ts',
      };
    }
  }

  async findById(id: number): Promise<User> {
    return await this.users.findOne({ id });
  }

  async update(
    userId: number,
    updatedInput: UpdateProfileInput,
  ): Promise<UpdateProfileOutput> {
    try {
      const user = await this.findById(userId);
      if (!user) throw Error(`User ID: ${userId} user is not found`);
      await this.users.update({ id: userId }, { ...updatedInput });
      return {
        ok: true,
        updated: user,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.toString(),
      };
    }
  }
}
