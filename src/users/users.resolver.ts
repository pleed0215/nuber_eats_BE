import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/auth/auth.guard';

import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
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
  me(@Context() context): User {
    return context['user'];
  }*/

  @Query(returns => User, { nullable: true })
  @UseGuards(AuthGuard)
  me(@Context() context): User {
    return context['user'];
  }
}
