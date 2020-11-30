import { Injectable } from '@nestjs/common';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { LessThan, Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
  GetAllPaymentsOutput,
  GetPaymentOutput,
} from './dtos/create-payment.dto';
import { Payment } from './entity/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurants.findOneOrFail(restaurantId);
      if (!restaurant.isOwner(owner))
        throw Error(
          `Owner: ${owner.email} is not owner of restaurant ${restaurant.name}`,
        );

      const date = new Date();
      date.setDate(date.getDate() + 7);
      await this.restaurants.update(restaurantId, {
        isPromoted: true,
        promotedUntil: date,
      });
      await this.payments.save(
        this.payments.create({
          transactionId,
          owner,
          restaurant,
        }),
      );

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.toString(),
      };
    }
  }

  async getPayment(owner: User, id: number): Promise<GetPaymentOutput> {
    try {
      const payment = await this.payments.findOneOrFail(id);
      if (payment.ownerId !== owner.id)
        throw Error(
          `You do not have permission to see this order.(order id: ${id})`,
        );
      return {
        ok: true,
        payment,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.toString(),
      };
    }
  }

  async getAllPayments(owner: User): Promise<GetAllPaymentsOutput> {
    try {
      const [payments, count] = await this.payments.findAndCount({
        where: {
          owner,
        },
      });
      return {
        ok: true,
        count: count,
        payments,
      };
    } catch (e) {
      return {
        ok: false,
        error: e.toString(),
      };
    }
  }

  @Interval(2000)
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurants.find({
      where: {
        isPromoted: true,
        promotedUntil: LessThan(new Date()),
      },
    });

    restaurants.forEach(async restaurant => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurants.save(restaurant);
    });
  }
}
