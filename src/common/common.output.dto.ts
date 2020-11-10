import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

@ObjectType()
export class CommonOutput {
  @Field(type => String, { nullable: true })
  error?: string;

  @Field(type => Boolean)
  ok: boolean;
}
