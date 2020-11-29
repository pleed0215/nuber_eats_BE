import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { AuthUser } from 'src/auth/auth.decorator';
import { Role } from 'src/auth/role.decorator';
import { PUB_SUB } from 'src/common/common.constant';
import { User } from 'src/users/entities/user.entity';
import {
  StatusesOutput,
  CreateOrderInput,
  CreateOrderOutput,
  GetOrdersInput,
  GetOrdersOutput,
  OrderDetailInput,
  OrderDetailOutput,
  UpdateOrderInput,
  UpdateOrderOutput,
} from './dtos/create-order.dto';
import { Order } from './entity/order.entity';
import { OrdersService } from './orders.service';

@Resolver(of => Order)
export class OrdersResolver {
  constructor(
    private readonly service: OrdersService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  @Mutation(type => CreateOrderOutput)
  @Role(['Client'])
  createOrder(
    @AuthUser() client: User,
    @Args('input') input: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.service.createOrder(client, input);
  }

  @Query(returns => OrderDetailOutput)
  @Role(['Any'])
  orderDetail(
    @AuthUser() user,
    @Args() input: OrderDetailInput,
  ): Promise<OrderDetailOutput> {
    return this.service.orderDetail(user, input.id);
  }

  @Query(returns => GetOrdersOutput)
  @Role(['Any'])
  getOrders(
    @AuthUser() user,
    @Args() input: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.service.getOrders(user, input);
  }

  @Mutation(returns => UpdateOrderOutput)
  @Role(['Owner', 'Delivery'])
  updateOrder(
    @AuthUser() user,
    @Args() input: UpdateOrderInput,
  ): Promise<UpdateOrderOutput> {
    return this.service.updateOrder(user, input);
  }

  @Query(returns => StatusesOutput)
  @Role(['Any'])
  enableStatuses(@AuthUser() user): StatusesOutput {
    return this.service.enableStatuses(user);
  }

  @Subscription(returns => String, {
    filter: ({ orderSubscription }, { id }) => {
      console.log(orderSubscription, id);
      return true;
    },
  })
  @Role(['Any'])
  orderSubscription(@AuthUser() user: User, @Args('id') id: number) {
    return this.pubsub.asyncIterator('orderSubscription');
  }

  @Mutation(returns => Boolean)
  orderReady(@Args('id') id: number) {
    console.log(id);
    this.pubsub.publish('orderSubscription', {
      orderSubscription: 'Subscription is ready.',
    });
    return true;
  }
}
