import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

import {
  UpdateRestaurantInput,
  UpdateRestaurantOutput,
} from './dtos/update-restaurant.dto';
import { CategoryRepository } from './entities/category.repository';

@Injectable()
export class RestaurantsService {
  /* 
  Restaurant Service class 
    - createRestaurant
    - editRestaurant
    - deleteRestaurant

    - getRestaurants
    - getCategories
    - getRestaunratsByCategory
    - getRestaurantDetail

  */
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(CategoryRepository)
    private readonly categories: CategoryRepository,
  ) {}

  // getAll: Get all restaurants
  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find({});
  }

  // createRestuarant
  // Authorization: Role is Owner.
  // return: ok, error, created restaurant.
  async createRestaurant(
    owner: User,
    input: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create({ ...input, owner });

      newRestaurant.category = await this.categories.findOrCreate(
        input.categoryName,
      );
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
        data: newRestaurant,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.toString(),
      };
    }
  }

  async updateRestaurant(
    owner: User,
    input: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantOutput> {
    try {
      const { id, categoryName, ...update } = input;
      const restaurant = await this.restaurants.findOneOrFail(id);

      if (restaurant.ownerId !== owner.id) {
        throw Error(
          `Owner: ${owner.email} is not owner of ${restaurant.name}.`,
        );
      }

      let category = null;
      if (categoryName) {
        category = await this.categories.findOrCreate(categoryName);
        await this.restaurants.update(id, { ...update, category });
      } else {
        await this.restaurants.update(id, { ...update });
      }

      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.toString(),
      };
    }
  }
}
