import { ArgsType, Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';
import { DishOption } from 'src/restaurants/entities/dish.entity';
import { OrderItemOption } from '../entity/order-item.entity';
import { Order } from '../entity/order.entity';

@InputType()
export class CreateOrderItemInput {
  @Field(type => Int)
  dishId: number;

  @Field(type => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field(type => Int)
  restaurantId: number;

  @Field(type => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CommonOutput {}

@ArgsType()
export class OrderDetailInput {
  @Field(type => Int)
  id: number;
}

@ObjectType()
export class OrderDetailOutput extends CommonOutput {
  @Field(type => Order, { nullable: true })
  order?: Order;
}
