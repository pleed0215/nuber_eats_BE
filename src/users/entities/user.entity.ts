import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { Verification } from './verification.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Order } from 'src/orders/entity/order.entity';
import { Payment } from 'src/payments/entity/payment.entity';

export enum UserRole {
  Client = 'Client',
  Owner = 'Owner',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field(type => String)
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Field(type => String)
  @Column({ select: false })
  @IsString()
  password: string;

  @Field(type => UserRole)
  @Column({ type: 'enum', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @Field(type => Boolean, { nullable: true })
  @Column({ default: false })
  @IsBoolean()
  verified: boolean;

  @OneToOne(
    type => Verification,
    verification => verification.user,
    { cascade: true },
  )
  verification: Verification;

  @Field(type => [Restaurant])
  @OneToMany(
    type => Restaurant,
    restaurant => restaurant.owner,
    { cascade: true },
  )
  restaurants: Restaurant[];

  @Field(type => [Order], { nullable: true })
  @OneToMany(
    type => Order,
    order => order.customer,
    { nullable: true },
  )
  orders: Order[];

  @Field(type => [Order], { nullable: true })
  @OneToMany(
    type => Order,
    order => order.driver,
    { nullable: true },
  )
  rides: Order[];

  @Field(type => [Payment], { nullable: true })
  @OneToMany(
    type => Payment,
    payment => payment.owner,
  )
  payments?: Payment[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    try {
      if (this.password) {
        this.password = await bcrypt.hash(this.password, 10);
      }
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async checkPassword(password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }
}
