import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';
import { Dish, DishOption } from '../entities/dish.entity';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'price',
  'description',
  'photo',
  'options',
] as const) {
  @Field(type => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateDishOutput extends CommonOutput {
  @Field(type => Dish, { nullable: true })
  dish?: Dish;
}

@ObjectType()
export class DeleteDishOutput extends CommonOutput {}

@ArgsType()
export class UpdateDishInput extends PartialType(
  PickType(
    Dish,
    ['name', 'price', 'description', 'options'] as const,
    ArgsType,
  ),
) {
  @Field(type => Int)
  dishId: number;
}

@ObjectType()
export class UpdateDishOutput extends CommonOutput {}

@ObjectType()
export class DishDetailOutput extends CommonOutput {
  @Field(type => Dish, { nullable: true })
  dish?: Dish;
}
