import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}
  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find({});
  }

  async createRestaurant(
    owner: User,
    input: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create({ ...input, owner });

      // make category name slug not to create category with same name becuase of similar category name.
      const categoryName = input.categoryName?.trim().toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-');

      // make a slug and findOne with slug name
      let category = await this.categories.findOne({ slug: categorySlug });
      if (category) {
        newRestaurant.category = category;
      } else {
        category = await this.categories.create({
          slug: categorySlug,
          name: categoryName,
          image: '',
        });
        await this.categories.save(category);
        newRestaurant.category = category;
      }

      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
        data: newRestaurant,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Cannot create restaurant.',
      };
    }
  }
}
