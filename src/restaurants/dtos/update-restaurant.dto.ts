import {
  Field,
  InputType,
  PartialType,
  ArgsType,
  ObjectType,
} from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';
import { CreateRestaurantInput } from './create-restaurant.dto';

@ArgsType()
export class UpdateRestaurantInputType extends PartialType(
  CreateRestaurantInput,
) {}

@ObjectType()
export class UpdateRestaurantOutput extends CommonOutput {}
