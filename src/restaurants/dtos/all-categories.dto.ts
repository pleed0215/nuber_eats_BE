import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/common.output.dto';
import { Category } from '../entities/category.entity';
import { Restaurant } from '../entities/restaurant.entity';

@ObjectType()
export class CategoryDetailOutput {
  @Field(type => Int, { nullable: true })
  count?: number;

  @Field(type => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}

@ObjectType()
export class AllCategoriesOutput extends CommonOutput {
  @Field(type => Int, { nullable: true })
  count?: number;

  @Field(type => [Category], { nullable: true })
  categories?: Category[];
}

@ObjectType()
export class CategoryOutput extends CommonOutput {
  @Field(types => Category, { nullable: true })
  category?: Category;
}
