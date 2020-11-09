import { Field, InputType, ObjectType, OmitType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@InputType()
export class CreateUserInput extends OmitType(
  User,
  ['id', 'createAt', 'updatedAt'] as const,
  InputType,
) {}

@ObjectType()
export class CreateUserOutput {
  @Field(type => String, { nullable: true })
  error?: string;

  @Field(type => Boolean)
  ok: boolean;
}
