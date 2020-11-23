import { Args, Context, Mutation, Query } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';

import { AuthUser } from 'src/auth/auth.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Role } from 'src/auth/role.decorator';

import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import {
  UpdatePasswordInput,
  UpdateProfileInput,
  UpdateProfileOutput,
} from './dtos/update-profile.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { VerificationInput, VerificationOutput } from './dtos/verification.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(returns => CreateUserOutput)
  createUser(@Args('input') input: CreateUserInput): Promise<CreateUserOutput> {
    return this.usersService.createUser(input);
  }

  @Mutation(returns => LoginOutput)
  async login(@Args() input: LoginInput): Promise<LoginOutput> {
    try {
      return await this.usersService.login({ ...input });
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'An error occured while login',
      };
    }
  }

  // due to use Guard concept in nestjs, this code was changed.
  // but for studying, i left this code.
  /*@Query(returns => User, { nullable: true })
  @UseGuards(AuthGuard)
  me(@Context() context): User {
    return context['user'];
  }*/

  // me: return profile of login user.
  @Query(returns => User, { nullable: true })
  @Role(['Any'])
  me(@AuthUser() authUser: User): User {
    return authUser;
  }

  // userProfile: profile of others

  @Query(returns => UserProfileOutput)
  @Role(['Any'])
  async userProfile(
    @Args() input: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const user = await this.usersService.findById(input.userId);
      if (!user) throw Error(`User ID: ${input.userId} user is not found.`);
      return {
        ok: true,
        user,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.toString(),
      };
    }
  }

  // Mutation updateProfile
  // update own profile except password

  @Mutation(returns => UpdateProfileOutput)
  @Role(['Any'])
  async updateProfile(
    @AuthUser() user: User,
    @Args('update') update: UpdateProfileInput,
  ): Promise<UpdateProfileOutput> {
    try {
      const result = await this.usersService.updateProfile(user.id, update);
      return result;
    } catch (e) {
      return {
        ok: false,
        error: e.toString(),
      };
    }
  }

  // Mutation password
  // update own password

  @Mutation(returns => LoginOutput)
  @Role(['Any'])
  async updatePassword(
    @AuthUser() user: User,
    @Args() passwordInput: UpdatePasswordInput,
  ): Promise<LoginOutput> {
    try {
      const result = await this.usersService.updatePassword(
        user.id,
        passwordInput.password,
      );

      if (result) {
        return await this.usersService.login({
          email: user.email,
          password: passwordInput.password,
        });
      } else {
        return {
          ok: false,
          error: 'While updating password, an error occured.',
        };
      }
    } catch (e) {
      return {
        ok: false,
        error: e.toString(),
      };
    }
  }

  // Mutation verify
  // process verification
  @Mutation(returns => VerificationOutput)
  async verifyCode(
    @Args() input: VerificationInput,
  ): Promise<VerificationOutput> {
    if (await this.usersService.verifyCode(input)) {
      return {
        ok: true,
      };
    } else {
      return {
        ok: false,
        error: 'Error on verification code.',
      };
    }
  }
}
