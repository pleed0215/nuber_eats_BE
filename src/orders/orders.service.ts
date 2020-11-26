import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateOrderInput,
  CreateOrderOutput,
  OrderDetailOutput,
} from './dtos/create-order.dto';
import { OrderItem } from './entity/order-item.entity';
import { Order } from './entity/order.entity';

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
  ) {}

  async createOrder(
    customer: User,
    input: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const { restaurantId, items } = input;
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
        const newOrderItem = this.orderItems.create({
          dish,
          order: newOrder,
        });
        newOrderItem.options = [...item.options];
        newOrderItems.push(await this.orderItems.save(newOrderItem));
      }

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

  async orderDetail(user: User, id: number): Promise<OrderDetailOutput> {
    try {
      const order = await this.orders.findOneOrFail(id, {
        relations: ['customer', 'driver', 'orderItems', 'restaurant'],
      });
      if (
        user.id === order.customerId ||
        user.id === order.driverId ||
        user.id === order.restaurant.ownerId
      ) {
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
}
