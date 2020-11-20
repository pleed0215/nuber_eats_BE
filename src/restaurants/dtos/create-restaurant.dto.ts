import { Restaurant } from '../entities/restaurant.entity';
import 'reflect-metadata';
import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { CommonOutput } from 'src/common/common.output.dto';

//@ArgsType()
@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImage',
  'address',
]) {
  @Field(type => String, { defaultValue: null, nullable: true })
  categoryName?: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CommonOutput {
  @Field(type => Restaurant, { nullable: true })
  data?: Restaurant;
}
// mapped type으로 인해 정의 안해도 된다.
// 3번째 argument는 생략되어 있으면, 부모의 decorator와 동일하고, 주어진다면 그 decorator를 따라간다.
/*@Field(type => String)
  @IsString()
  @Length(5, 20)
  name: string;

  @Field(type => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Field(type => String)
  @IsString()
  address: string;

  @Field(type => String)
  @IsString()
  ownerName: string;

  @Field(type => String)
  @IsString()
  categoryName: string;*/
