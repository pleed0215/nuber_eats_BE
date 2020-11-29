import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import {
  PUB_SUB,
  TRIGGER_NEW_COOKED_ORDER,
  TRIGGER_NEW_PENDING_ORDER,
  TRIGGER_ORDER_UPDATE,
} from 'src/common/common.constant';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { PlainObjectToNewEntityTransformer } from 'typeorm/query-builder/transformer/PlainObjectToNewEntityTransformer';
import {
  CreateOrderInput,
  CreateOrderOutput,
  GetOrdersInput,
  GetOrdersOutput,
  OrderDetailOutput,
  StatusesOutput,
  UpdateOrderInput,
  UpdateOrderOutput,
} from './dtos/create-order.dto';
import { OrderItem, OrderItemOption } from './entity/order-item.entity';
import { Order, OrderStatus } from './entity/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @Inject(PUB_SUB)
    private readonly pubsub: PubSub,
  ) {}

  async createOrder(
    customer: User,
    input: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const { restaurantId, items } = input;
      let totalCost = 0;
      const restaurant = await this.restaurants.findOneOrFail(restaurantId, {
        relations: ['dishes'],
      });
      const newOrder = await this.orders.save(
        this.orders.create({ restaurant, customer }),
      );

      const newOrderItems: OrderItem[] = [];

      for (const item of items) {
        const dish = restaurant.dishes.find(dish => dish.id === item.dishId);

        if (!dish) {
          await this.orders.delete(newOrder.id);
          throw Error(`Invalid dish id: ${item.dishId}`);
        }

        totalCost += dish.price;
        const newOrderItem = this.orderItems.create({
          dish,
          order: newOrder,
        });
        newOrderItem.options = [...item.options];

        for (const option of item.options) {
          // extra can be 'null'
          if (option.extra) totalCost += option.extra;
          if (option.choice.extra) totalCost += option.choice.extra;
        }
        newOrderItems.push(await this.orderItems.save(newOrderItem));
      }
      newOrder.orderItems = [...newOrderItems];
      newOrder.totalCost = totalCost;
      await this.orders.update(newOrder.id, { totalCost });
      await this.pubsub.publish(TRIGGER_NEW_PENDING_ORDER, {
        pendingOrders: { order: newOrder, ownerId: restaurant.ownerId },
      });

      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.toString(),
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    return (
      user.id === order.customerId ||
      user.id === order.driverId ||
      user.id === order.restaurant.ownerId
    );
  }

  async orderDetail(user: User, id: number): Promise<OrderDetailOutput> {
    try {
      /*const order = await this.orders.findOneOrFail(id, {
        relations: ['customer', 'driver', 'orderItems', 'restaurant'],
      });*/

      const order = await this.orders
        .createQueryBuilder('order')
        .where('order.id = :id', { id })
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.driver', 'driver')
        .leftJoinAndSelect('order.restaurant', 'restaurant')
        .leftJoinAndSelect('order.orderItems', 'orderItems')
        .leftJoinAndSelect('orderItems.dish', 'dish')
        .getOneOrFail();

      if (this.canSeeOrder(user, order)) {
        return {
          ok: true,
          order,
        };
      } else {
        throw Error(
          `User: ${user.email} is not customer or driver or restaurant owner. No right to see this order`,
        );
      }
    } catch (e) {
      return {
        ok: false,
        error: e.toString(),
      };
    }
  }

  async getOrders(user: User, input: GetOrdersInput): Promise<GetOrdersOutput> {
    /*
      canSee: Owner, Delivery, Client
        - Authorization
        Owner:
          Can See: All or one restauant's order
        Delivery:
          Can See: Only one restaurant's order
        Client:
          Can See: Only ordered restaunt's order

      if order status is offered, see  orders is only that status,
      or see all orders of all status.
    */
    try {
      const { status } = input;
      let orders;

      if (user.role === UserRole.Owner) {
        const ordersQuery = await this.orders
          .createQueryBuilder('order')
          .leftJoinAndSelect('order.restaurant', 'restaurant')
          .leftJoinAndSelect('order.orderItems', 'orderItems')
          .leftJoinAndSelect('orderItems.dish', 'dish')
          .where('restaurant.owner.id=:ownerId', { ownerId: user.id })
          .andWhere(status ? 'order.orderStatus=:status' : '1=1', { status })
          .getMany();
        orders = [...ordersQuery];
      } else if (user.role === UserRole.Delivery) {
        const ordersQuery = await this.orders
          .createQueryBuilder('order')
          .leftJoinAndSelect('order.restaurant', 'restaurant')
          .leftJoinAndSelect('order.orderItems', 'orderItems')
          .leftJoinAndSelect('orderItems.dish', 'dish')
          .where('order.driver.id=:driverId', { driverId: user.id })
          .andWhere(status ? 'order.orderStatus=:status' : '1=1', { status })
          .getMany();
        orders = [...ordersQuery];
      } else if (user.role === UserRole.Client) {
        const ordersQuery = await this.orders
          .createQueryBuilder('order')
          .leftJoinAndSelect('order.restaurant', 'restaurant')
          .leftJoinAndSelect('order.orderItems', 'orderItems')
          .leftJoinAndSelect('orderItems.dish', 'dish')
          .where('order.customer.id=:customerId', { customerId: user.id })
          .andWhere(status ? 'order.orderStatus=:status' : '1=1', { status })
          .getMany();
        orders = [...ordersQuery];
      }

      return {
        ok: true,
        orders,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.toString(),
      };
    }
  }

  async updateOrder(
    user: User,
    { id, orderStatus }: UpdateOrderInput,
  ): Promise<UpdateOrderOutput> {
    try {
      const order = await this.orders.findOneOrFail(id, {
        relations: ['restaurant', 'restaurant.owner', 'customer', 'driver'],
      });
      if (user.role === UserRole.Owner && user.id !== order.restaurant.ownerId)
        throw Error(
          `Owner: ${user.email} is not owner of ${order.restaurant.name}`,
        );
      let willUpdate = {};
      if (
        orderStatus === OrderStatus.Cooked ||
        orderStatus === OrderStatus.Cooking
      ) {
        if (user.role !== UserRole.Owner) {
          throw Error(
            'Only owner can change order status to Cooked or Cooking',
          );
        } else {
          if (orderStatus === OrderStatus.Cooked) {
            this.pubsub.publish(TRIGGER_NEW_COOKED_ORDER, {
              cookedOrders: {
                order: {
                  ...order,
                  orderStatus,
                },
              },
            });
          }
        }
      } else if (
        orderStatus === OrderStatus.Pickedup ||
        orderStatus === OrderStatus.Delivered
      ) {
        if (user.role !== UserRole.Delivery) {
          throw Error(
            'Only deliver can change order status to Pickedup or Delivered',
          );
        } else {
          if (orderStatus === OrderStatus.Pickedup) {
            if (order.driver)
              throw Error(
                `This order id: ${order.id} already has driver to delivery.`,
              );
            willUpdate = {
              driver: user,
            };
          }
        }
      } else {
        throw Error('Status is invalid.');
      }
      this.orders.update(id, { ...willUpdate });
      await this.pubsub.publish(TRIGGER_ORDER_UPDATE, {
        orderUpdate: {
          order: {
            ...order,
            ...willUpdate,
            orderStatus,
          },
        },
      });
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.toString(),
      };
    }
  }

  enableStatuses(user: User): StatusesOutput {
    let statuses: OrderStatus[] = [];

    switch (user.role) {
      case UserRole.Owner:
        statuses = [OrderStatus.Cooked, OrderStatus.Cooking];
        break;
      case UserRole.Delivery:
        statuses = [OrderStatus.Delivered, OrderStatus.Pickedup];
        break;
      default:
        break;
    }
    return {
      ok: true,
      statuses,
    };
  }
}
