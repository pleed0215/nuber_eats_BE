import { Restaurant } from './entities/restaurant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CategoryResolver, RestaurantsResolver } from './restaurants.resolver';
import { RestaurantsService } from './restaurants.service';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './entities/category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])],
  providers: [RestaurantsResolver, CategoryResolver, RestaurantsService],
})
export class RestaurantsModule {}
