import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}
  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find({});
  }

  createRestaurant(restaurant: CreateRestaurantDto): Promise<Restaurant> {
    const newRestaurant = this.restaurants.create(restaurant);
    return this.restaurants.save(newRestaurant);
  }
}
