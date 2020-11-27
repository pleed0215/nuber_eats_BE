import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderSatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  Pickedu = 'Pickedup',
  Deliver = 'Delivered',
}

registerEnumType(OrderSatus, { name: 'OrderStatus' });

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
  @RelationId((order: Order) => order.customer)
  customerId: number;

  @Field(type => User, { nullable: true })
  @ManyToOne(
    type => User,
    user => user.rides,
    { nullable: true, onDelete: 'SET NULL' },
  )
  driver?: User;
  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field(type => [OrderItem], { nullable: true })
  @OneToMany(
    type => OrderItem,
    orderItems => orderItems.order,
  )
  orderItems: OrderItem[];

  @Field(type => Number, { nullable: true })
  @IsNumber()
  @Column({ nullable: true })
  totalCost: number;

  @Field(type => Restaurant, { nullable: true })
  @ManyToOne(
    type => Restaurant,
    restaurant => restaurant.orders,
    { onDelete: 'SET NULL', nullable: true },
  )
  restaurant: Restaurant;
  @RelationId((order: Order) => order.restaurant)
  restaurantId: number;

  @Field(type => OrderSatus)
  @Column({ type: 'enum', enum: OrderSatus, default: 'Pending' })
  @IsEnum(OrderSatus)
  orderStatus: OrderSatus;
}
