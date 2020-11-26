import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish, DishChoiceOption } from 'src/restaurants/entities/dish.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Order } from './order.entity';

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field(type => String)
  name: string;

  @Field(type => DishChoiceOption, { nullable: true })
  choice: DishChoiceOption;

  @Field(type => Number, { nullable: true })
  extra?: number;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field(type => Dish)
  @ManyToOne(
    type => Dish,
    dish => dish.orderItems,
    { onDelete: 'CASCADE' },
  )
  dish: Dish;

  @Field(type => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];

  @Field(type => Order)
  @ManyToOne(
    type => Order,
    order => order.orderItems,
    { onDelete: 'CASCADE' },
  )
  order: Order;
}
