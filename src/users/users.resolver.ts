import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';

import { AuthUser } from 'src/auth/auth.decorator';
import { AuthGuard } from 'src/auth/auth.guard';

import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import {
  UpdateProfileInput,
  UpdateProfileOutput,
} from './dtos/update-profile.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(of => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(returns => Boolean)
  hi(): boolean {
    return true;
  }

  @Mutation(returns => CreateUserOutput)
  async createUser(
    @Args('input') input: CreateUserInput,
  ): Promise<CreateUserOutput> {
    try {
      return await this.usersService.createUser(input);
    } catch (e) {
      console.log(e);
      return {
        ok: false,
        error: 'In mutation createUser, an error occured.',
      };
    }
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

  @Query(returns => User, { nullable: true })
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User): User {
    return authUser;
  }

  @UseGuards(AuthGuard)
  @Query(returns => UserProfileOutput)
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

  @UseGuards(AuthGuard)
  @Mutation(returns => UpdateProfileOutput)
  async updateProfile(
    @AuthUser() user: User,
    @Args('update') update: UpdateProfileInput,
  ): Promise<UpdateProfileOutput> {
    return await this.usersService.update(user.id, update);
  }
}
