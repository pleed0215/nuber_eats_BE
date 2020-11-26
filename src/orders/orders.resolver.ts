import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Order } from './entity/order.entity';
import { OrdersService } from './orders.service';

@Resolver(of => Order)
export class OrdersResolver {
  constructor(private readonly service: OrdersService) {}

  @Mutation(type => CreateOrderOutput)
  @Role(['Client'])
  createOrder(
    @AuthUser() client: User,
    @Args('input') input: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.service.createOrder(client, input);
  }
}
