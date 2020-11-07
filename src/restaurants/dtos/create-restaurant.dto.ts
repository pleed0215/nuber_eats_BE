import 'reflect-metadata';
import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

//@InputType()
@ArgsType()
export class CreateRestaurantDto {
  @Field(type => String)
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
}
