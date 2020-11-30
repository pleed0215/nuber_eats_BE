import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entity/order.entity';
import { Payment } from 'src/payments/entity/payment.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Category } from './category.entity';
import { Dish } from './dish.entity';

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field(type => String)
  @Column()
  @IsString()
  @Length(3, 50)
  name: string;

  @Field(type => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field(type => String)
  @Column()
  @IsString()
  address: string;

  @Field(type => Category, { nullable: true })
  @ManyToOne(
    type => Category,
    category => category.restaurants,
    { nullable: true, onDelete: 'SET NULL' },
  )
  category: Category;
  @RelationId((restaurant: Restaurant) => restaurant.category)
  categoryId: number;

  @Field(type => User)
  @ManyToOne(
    type => User,
    user => user.restaurants,
    { onDelete: 'CASCADE' },
  )
  owner: User;
  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(type => [Dish], { nullable: true })
  @OneToMany(
    type => Dish,
    dish => dish.restaurant,
  )
  dishes: Dish[];

  @Field(type => [Order], { nullable: true })
  @OneToMany(
    type => Order,
    order => order.restaurant,
  )
  orders: Order[];

  @Field(type => [Payment], { nullable: true })
  @OneToMany(
    type => Payment,
    payment => payment.restaurant,
  )
  payments: Payment[];

  @Field(type => Boolean)
  @Column({ default: false })
  isPromoted: boolean;

  @Field(type => Date, { nullable: true })
  @Column({ nullable: true })
  promotedUntil?: Date;

  isOwner(owner: User): boolean {
    return this.ownerId === owner.id;
  }
}
