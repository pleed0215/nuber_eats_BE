import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@InputType('DishChoiceType', { isAbstract: true })
@ObjectType()
export class DishChoiceOption {
  @Field(type => String)
  name: string;

  @Field(type => Number, { nullable: true })
  extra?: number;
}

@InputType('DishOptionType', { isAbstract: true })
@ObjectType()
export class DishOption {
  @Field(type => String)
  name: string;

  @Field(type => [DishChoiceOption], { nullable: true })
  choices?: DishChoiceOption[];

  @Field(type => Number, { nullable: true })
  extra?: number;
}

@InputType('DishInputType', { isAbstract: true })
@Entity()
@ObjectType()
export class Dish extends CoreEntity {
  @Field(type => String)
  @Column()
  @IsString()
  name: string;

  @Field(type => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo: string;

  @Field(type => String)
  @Column()
  @IsString()
  @Length(5, 140)
  description: string;

  @Field(type => Restaurant)
  @ManyToOne(
    type => Restaurant,
    restaurant => restaurant.dishes,
    { onDelete: 'CASCADE' },
  )
  restaurant: Restaurant;
  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field(type => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
