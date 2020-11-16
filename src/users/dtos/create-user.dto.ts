import {
  Field,
  InputType,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class CreateUserInput extends PickType(
  User,
  ['email', 'password', 'verified', 'role'] as const,
  InputType,
) {}

@ObjectType()
export class CreateUserOutput extends CommonOutput {
  @Field(type => User, { nullable: true })
  data?: User;
}
