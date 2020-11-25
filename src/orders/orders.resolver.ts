import { Resolver } from '@nestjs/graphql';
import { Order } from './entity/order.entity';
import { OrdersService } from './orders.service';

@Resolver(of => Order)
export class OrdersResolver {
  constructor(private readonly service: OrdersService) {}
}
