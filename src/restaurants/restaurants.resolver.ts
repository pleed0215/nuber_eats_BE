import { RestaurantsService } from './../restaurants/restaurants.service';
import {
  Resolver,
  Query,
  Args,
  Mutation,
  ResolveField,
  Int,
  Parent,
} from '@nestjs/graphql';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';

import { AuthUser } from 'src/auth/auth.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';
import {
  UpdateRestaurantInput,
  UpdateRestaurantOutput,
} from './dtos/update-restaurant.dto';
import { DeleteRestaurantOutput } from './dtos/delete-restaurants.dto';
import {
  AllCategoriesOutput,
  CategoryDetailOutput,
  CategoryInput,
  CategoryOutput,
} from './dtos/all-categories.dto';
import { Category } from './entities/category.entity';
import { getRepository, Repository } from 'typeorm';

@Resolver(of => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}
  @Query(returns => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(returns => CreateRestaurantOutput)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input')
    input: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return await this.restaurantService.createRestaurant(authUser, input);
  }

  @Mutation(returns => UpdateRestaurantOutput)
  @Role(['Owner'])
  async updateRestaurant(
    @AuthUser() authUser: User,
    @Args('input') input: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantOutput> {
    return this.restaurantService.updateRestaurant(authUser, input);
  }

  // deleteRestaurant
  @Mutation(returns => DeleteRestaurantOutput)
  @Role(['Owner'])
  async deleteRestaurant(
    @AuthUser() authUser: User,
    @Args('id') id: number,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(authUser, id);
  }
}

@Resolver(of => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @ResolveField(type => CategoryDetailOutput)
  async restaurantsOn(
    @Parent() category: Category,
  ): Promise<CategoryDetailOutput> {
    const categoryDetail = await this.restaurantService.getCategoryDetail(
      category.id,
    );
    const numRestaurants = await this.restaurantService.countRestaurantsInCategory(
      category,
    );
    return {
      count: numRestaurants,
      restaurants: [...categoryDetail.restaurants],
    };
  }

  @Query(returns => CategoryOutput)
  @Role(['Any'])
  category(@Args() input: CategoryInput): Promise<CategoryOutput> {
    return this.restaurantService.getRestaurantsByCategory(input);
  }

  @Query(returns => AllCategoriesOutput)
  @Role(['Any'])
  allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.getAllCategories();
  }
}
