import { Restaurant } from './entities/restaurant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RestaurantsResolver } from './restaurants.resolver';
import { RestaurantsService } from './restaurants.service';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './entities/category.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Restaurant, CategoryRepository]),
  ],
  providers: [RestaurantsResolver, RestaurantsService],
})
export class RestaurantsModule {}
