import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  PartialType,
} from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';
import { CreateRestaurantInput } from './create-restaurant.dto';

@InputType()
export class UpdateRestaurantInput extends PartialType(
  CreateRestaurantInput,
  InputType,
) {
  @Field(type => Number)
  id: number;

  @Field(type => String, { nullable: true })
  categoryName?: string;
}

@ObjectType()
export class UpdateRestaurantOutput extends CommonOutput {}
