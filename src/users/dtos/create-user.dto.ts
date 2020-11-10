import { Field, InputType, ObjectType, OmitType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class CreateUserInput extends OmitType(
  User,
  ['id', 'createAt', 'updatedAt'] as const,
  InputType,
) {}

@ObjectType()
export class CreateUserOutput extends CommonOutput {
  @Field(type => User, { nullable: true })
  data?: User;
}
