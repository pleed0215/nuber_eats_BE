import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';

import { JwtService } from 'src/jwt/jwt.service';
import { UpdateProfileInput } from './dtos/update-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerificationInput } from './dtos/verification.dto';

import { MailService } from 'src/mail/mail.service';
import { SERVER_HOST } from 'src/common/common.constant';

@Injectable()
export class UsersService {
  constructor(
    private readonly mailService: MailService,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
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
        const newVerification = await this.verifications.save(
          this.verifications.create({ user: newUser }),
        );

        await this.mailService.sendVerificationEmail(
          email,
          email,
          SERVER_HOST,
          newVerification.code,
        );
        return {
          ok: true,
          data: newUser,
        };
      }
    } catch (e) {
      return {
        ok: false,
        error: 'An error occured when creating a user accound.',
      };
    }
  }

  // login
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      // code modified -> because password field was modified that from select true to false.
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );

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
      return {
        ok: false,
        error: 'Login failed. This is from login method of users.service.ts',
      };
    }
  }

  async findById(id: number): Promise<User> {
    try {
      const foundUser = await this.users.findOneOrFail({ id });
      return foundUser;
    } catch (e) {
      return null;
    }
  }

  async updateProfile(
    userId: number,
    updatedInput: UpdateProfileInput,
  ): Promise<boolean> {
    try {
      const updatedUser = await this.users.findOneOrFail(userId, {
        loadRelationIds: true,
      });
      const { email } = updatedInput;
      let code = null;
      if (email && email !== updatedUser.email) {
        if (updatedUser.verification)
          await this.verifications.delete(updatedUser.verification);
        const newVerification = await this.verifications.save(
          this.verifications.create({ user: updatedUser }),
        );
        code = newVerification.code;
        updatedInput.verified = false;
      }
      await this.users.update({ id: userId }, { ...updatedInput });
      if (email && code)
        await this.mailService.sendVerificationEmail(
          email,
          email,
          SERVER_HOST,
          code,
        );
      return true;
    } catch (e) {
      return false;
    }
  }

  async updatePassword(userId: number, password: string): Promise<boolean> {
    try {
      const willUpdate = await this.users.findOneOrFail({ id: userId });
      willUpdate.password = password;
      await this.users.save(willUpdate);
      return true;
    } catch (e) {
      return false;
    }
  }

  async verifyCode({ code }: VerificationInput): Promise<boolean> {
    try {
      const verification = await this.verifications.findOneOrFail(
        { code },
        { relations: ['user'] },
      );

      verification.user.verified = true;
      await this.users.save(verification.user);
      await this.verifications.delete(verification.id);
      return true;
    } catch (e) {
      return false;
    }
  }
}
