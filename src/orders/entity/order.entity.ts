import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, ManyToOne } from 'typeorm';

export enum OrderSatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Pickedu = 'Pickedup',
  Deliver = 'Delivered',
}

registerEnumType(OrderSatus, { name: 'OrderStatus' });

@InputType('OrderItemType', { isAbstract: true })
@ObjectType()
export class OrderItem {}

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(type => User, { nullable: true })
  @ManyToOne(
    type => User,
    user => user.orders,
    { onDelete: 'SET NULL', nullable: true },
  )
  customer: User;

  @Field(type => User, { nullable: true })
  @ManyToOne(
    type => User,
    user => user.rides,
    { nullable: true, onDelete: 'SET NULL' },
  )
  driver?: User;

  @Field(type => Restaurant)
  @ManyToOne(
    type => Restaurant,
    restaurant => restaurant.orders,
    { onDelete: 'SET NULL' },
  )
  restaurant: Restaurant;
}
