import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';

@ArgsType()
export class RestaurantsInput extends PaginationInput {}

@ObjectType()
export class RestaurantsOutput extends PaginationOutput {
  @Field(types => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}

@ObjectType()
export class RestaurantDetailOutput extends CommonOutput {
  @Field(types => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
