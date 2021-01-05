import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { AuthUser } from 'src/auth/auth.decorator';
import { Role } from 'src/auth/role.decorator';
import {
  PUB_SUB,
  TRIGGER_NEW_COOKED_ORDER,
  TRIGGER_NEW_PENDING_ORDER,
  TRIGGER_ORDER_UPDATE,
} from 'src/common/common.constant';
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
  GetAllOrdersOutput,
  GetRestaurantOrdersOutput,
  GetRestaurantOrdersInput,
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

  @Subscription(returns => Order, {
    filter: ({ pendingOrders: { ownerId } }, _, { user }) => {
      return user.id === ownerId;
    },
    resolve: ({ pendingOrders: { order } }) => order,
  })
  @Role(['Owner'])
  pendingOrders() {
    return this.pubsub.asyncIterator(TRIGGER_NEW_PENDING_ORDER);
  }

  @Subscription(returns => Order, {
    filter: ({ cookedOrders: { ownerId } }, _, { user }) => {
      return true;
    },
    resolve: ({ cookedOrders: { order } }) => order,
  })
  @Role(['Delivery'])
  cookedOrders() {
    return this.pubsub.asyncIterator(TRIGGER_NEW_COOKED_ORDER);
  }

  @Subscription(returns => Order, {
    filter: (
      { orderUpdate: { order } },
      { orderId },
      { user }: { user: User },
    ) => {
      if (
        order.customer.id === user.id ||
        order.driver.id === user.id ||
        order.restaurant.owner.id === user.id
      )
        return order.id === orderId;
      else return false;
    },
    resolve: ({ orderUpdate: { order } }) => order,
  })
  @Role(['Any'])
  orderUpdate(@Args('orderId') orderId: number) {
    return this.pubsub.asyncIterator(TRIGGER_ORDER_UPDATE);
  }

  @Query(returns => GetAllOrdersOutput)
  @Role(['Client', 'Delivery'])
  getAllOrders(@AuthUser() user: User): Promise<GetAllOrdersOutput> {
    return this.service.getAllOrders(user);
  }

  @Query(returns => GetRestaurantOrdersOutput)
  @Role(['Owner'])
  getRestaurantOrders(
    @AuthUser() user: User,
    @Args('input') input: GetRestaurantOrdersInput,
  ): Promise<GetRestaurantOrdersOutput> {
    return this.service.getRestaurantOrders(user, input);
  }
}
