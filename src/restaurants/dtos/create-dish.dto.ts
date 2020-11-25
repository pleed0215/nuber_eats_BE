import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';
import { Dish, DishOption } from '../entities/dish.entity';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'price',
  'description',
  'options',
] as const) {
  @Field(type => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateDishOutput extends CommonOutput {}
