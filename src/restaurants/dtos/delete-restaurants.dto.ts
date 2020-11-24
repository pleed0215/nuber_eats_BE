import { ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';

@ObjectType()
export class DeleteRestaurantOutput extends CommonOutput {}
