import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
  GetAllPaymentsOutput,
  GetPaymentOutput,
} from './dtos/create-payment.dto';
import { Payment } from './entity/payment.entity';
import { PaymentsService } from './payments.service';

@Resolver(of => Payment)
export class PaymentsResolver {
  constructor(private readonly service: PaymentsService) {}

  @Mutation(returns => CreatePaymentOutput)
  @Role(['Owner'])
  createPayment(
    @AuthUser() owner: User,
    @Args('input') input: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    return this.service.createPayment(owner, input);
  }

  @Query(returns => GetPaymentOutput)
  @Role(['Owner'])
  getPayment(
    @AuthUser() owner: User,
    @Args('id') id: number,
  ): Promise<GetPaymentOutput> {
    return this.service.getPayment(owner, id);
  }

  @Query(returns => GetAllPaymentsOutput)
  @Role(['Owner'])
  getAllPayments(@AuthUser() owner: User): Promise<GetAllPaymentsOutput> {
    return this.service.getAllPayments(owner);
  }
}
