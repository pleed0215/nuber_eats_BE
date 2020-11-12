import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';
import { User } from '../entities/user.entity';

@ArgsType()
export class UserProfileInput {
  @Field(type => Number)
  userId: number;
}

@ObjectType()
export class UserProfileOutput extends CommonOutput {
  @Field(type => User, { nullable: true })
  user?: User;
}
