import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';
import { Payment } from '../entity/payment.entity';

@InputType()
export class CreatePaymentInput {
  @Field(type => Int)
  transactionId: number;

  @Field(type => Int)
  restaurantId: number;
}

@ObjectType()
export class CreatePaymentOutput extends CommonOutput {}

@ObjectType()
export class GetPaymentOutput extends CommonOutput {
  @Field(type => Payment, { nullable: true })
  payment?: Payment;
}

@ObjectType()
export class GetAllPaymentsOutput extends CommonOutput {
  @Field(type => [Payment], { nullable: true })
  payments?: Payment[];

  @Field(type => Int, { nullable: true })
  count?: number;
}
