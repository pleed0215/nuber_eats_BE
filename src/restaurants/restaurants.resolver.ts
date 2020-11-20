import { RestaurantsService } from './../restaurants/restaurants.service';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(of => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}
  @Query(returns => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @UseGuards(AuthGuard)
  @Mutation(returns => CreateRestaurantOutput)
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input')
    input: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return await this.restaurantService.createRestaurant(authUser, input);
  }
}
