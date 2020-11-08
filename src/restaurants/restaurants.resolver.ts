import { RestaurantsService } from './../restaurants/restaurants.service';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';

@Resolver(of => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}
  @Query(returns => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }
  @Mutation(returns => Boolean)
  async createRestaurant(
    @Args('input')
    createRestaurantInput: CreateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantInput);
      return true;
    } catch (e) {
      return false;
    }
  }

  @Mutation(returns => Boolean)
  async updateRestaurant(@Args() input: UpdateRestaurantDto): Promise<boolean> {
    try {
      console.log(input);
      await this.restaurantService.updateRestaurant(input);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
