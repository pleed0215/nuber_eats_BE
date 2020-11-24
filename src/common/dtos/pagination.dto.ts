import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from '../common.output.dto';

@InputType()
export class PaginationInput {
  @Field(type => Int, { defaultValue: 1 })
  page: number;
}

@ObjectType()
export class PaginationOutput extends CommonOutput {
  @Field(type => Int, { nullable: true })
  totlaPages: number;
}
