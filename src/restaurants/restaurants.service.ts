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
import { DeleteRestaurantOutput } from './dtos/delete-restaurants.dto';
import { Category } from './entities/category.entity';
import {
  AllCategoriesOutput,
  CategoryInput,
  CategoryOutput,
} from './dtos/all-categories.dto';
import { Int } from '@nestjs/graphql';
import {
  RestaurantDetailOutput,
  RestaurantsOutput,
} from './dtos/restaurants.dto';

let PAGE_SIZE = 10;

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

  // are you Owner of that restaurant?
  private async isOwner(owner: User, id: number): Promise<boolean> {
    const restaurant = await this.restaurants.findOne(id);
    return restaurant && restaurant.ownerId === owner.id;
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
      const isOwner = await this.isOwner(owner, id);
      if (!isOwner) {
        throw Error(`Owner: ${owner.email} is not owner of this restaurant.`);
      }

      if (categoryName) {
        const category = await this.categories.findOrCreate(categoryName);
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

  // deleteRestaurant
  async deleteRestaurant(
    owner: User,
    id: number,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const isOwner = await this.isOwner(owner, id);
      if (!isOwner) {
        throw Error(`Owner: ${owner.email} is not owner of this restaurant.`);
      }

      await this.restaurants.delete(id);
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

  // categories..
  async getAllCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find({});

      return {
        ok: true,
        count: categories.length,
        categories: [...categories],
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  async getCategoryDetail(categoryId: number): Promise<Category> {
    return await this.categories.findOne(categoryId, {
      relations: ['restaurants'],
    });
  }

  async countRestaurantsInCategory(category: Category): Promise<number> {
    return await this.restaurants.count({ category });
  }

  async getRestaurantsByCategory({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOneOrFail({ slug });
      const skipCount = (page - 1) * PAGE_SIZE;

      const restaurants = await this.restaurants.find({
        where: { category },
        take: PAGE_SIZE,
        skip: skipCount,
      });
      const countTotalItems = await this.countRestaurantsInCategory(category);

      return {
        ok: true,
        totalPages: Math.ceil(countTotalItems / PAGE_SIZE),
        currentPage: page,
        countTotalItems,
        category,
        restaurants,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.toString(),
      };
    }
  }

  async getRestaurants(page: number): Promise<RestaurantsOutput> {
    try {
      const skipCount = (page - 1) * PAGE_SIZE;
      const [
        restaurants,
        countTotalItems,
      ] = await this.restaurants.findAndCount({
        take: PAGE_SIZE,
        skip: skipCount,
      });

      return {
        ok: true,
        totalPages: Math.ceil(countTotalItems / PAGE_SIZE),
        currentPage: page,
        countTotalItems,
        restaurants,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.toString(),
      };
    }
  }

  async getRestaurant(id: number): Promise<RestaurantDetailOutput> {
    try {
      const restaurant = await this.restaurants.findOneOrFail(id);
      console.log('jjj', restaurant);
      return {
        ok: true,
        restaurant,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.toString(),
      };
    }
  }
}
