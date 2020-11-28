import {
  ArgsType,
  Field,
  InputType,
  Int,
  ObjectType,
  PickType,
} from '@nestjs/graphql';

import { CommonOutput } from 'src/common/common.output.dto';
import { OrderItemOption } from '../entity/order-item.entity';
import { Order, OrderStatus } from '../entity/order.entity';

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

@ArgsType()
export class GetOrdersInput {
  @Field(type => OrderStatus, { nullable: true })
  status?: OrderStatus;
}

@ObjectType()
export class GetOrdersOutput extends CommonOutput {
  @Field(type => [Order], { nullable: true })
  orders?: Order[];
}

@ArgsType()
export class UpdateOrderInput extends PickType(
  Order,
  ['id', 'orderStatus'] as const,
  ArgsType,
) {}

@ObjectType()
export class UpdateOrderOutput extends CommonOutput {}

@ObjectType()
export class StatusesOutput extends CommonOutput {
  @Field(type => [OrderStatus])
  statuses: OrderStatus[];
}
