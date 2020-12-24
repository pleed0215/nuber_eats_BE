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
  MyRestaurantsOutput,
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
import {
  RestaurantDetailOutput,
  RestaurantsInput,
  RestaurantsOutput,
} from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Dish } from './entities/dish.entity';
import {
  CreateDishInput,
  CreateDishOutput,
  DeleteDishOutput,
  DishDetailOutput,
  UpdateDishInput,
  UpdateDishOutput,
} from './dtos/create-dish.dto';

@Resolver(of => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}
  @Query(returns => RestaurantsOutput)
  @Role(['Any'])
  allRestaurants(@Args('page') page: number): Promise<RestaurantsOutput> {
    return this.restaurantService.getRestaurants(page);
  }

  @Query(returns => RestaurantDetailOutput)
  @Role(['Any'])
  restaurant(@Args('id') id: number): Promise<RestaurantDetailOutput> {
    return this.restaurantService.getRestaurant(id);
  }

  @Query(returns => SearchRestaurantOutput)
  @Role(['Any'])
  searchRestaurantByName(
    @Args('search') search: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    return this.restaurantService.searchRestaurantByName(search);
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

  @Query(returns => MyRestaurantsOutput)
  @Role(['Owner'])
  async myRestaurants(
    @AuthUser() authUser: User,
  ): Promise<MyRestaurantsOutput> {
    return this.restaurantService.myRestaurants(authUser);
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

@Resolver(of => Dish)
export class DishResolver {
  constructor(private readonly service: RestaurantsService) {}

  @Mutation(type => CreateDishOutput)
  @Role(['Owner'])
  createDish(
    @AuthUser() owner: User,
    @Args('input') input: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.service.createDish(owner, input);
  }

  @Mutation(type => DeleteDishOutput)
  @Role(['Owner'])
  deleteDish(
    @AuthUser() owner: User,
    @Args('dishId') id: number,
  ): Promise<DeleteDishOutput> {
    return this.service.deleteDish(owner, id);
  }

  @Mutation(type => UpdateDishOutput)
  @Role(['Owner'])
  updateDish(
    @AuthUser() owner: User,
    @Args() input: UpdateDishInput,
  ): Promise<UpdateDishOutput> {
    return this.service.updateDish(owner, input);
  }

  @Query(returns => DishDetailOutput)
  @Role(['Any'])
  getDish(@Args('dishId', { type: () => Int }) dishId: number) {
    return this.service.getDish(dishId);
  }
}
