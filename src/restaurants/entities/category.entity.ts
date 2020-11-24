import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, getRepository, OneToMany, Repository } from 'typeorm';

import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(type => String)
  @Column({ unique: true })
  @IsString()
  @Length(3)
  name: string;

  @Field(type => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @Field(type => String)
  @Column()
  @IsString()
  image: string;

  @OneToMany(
    type => Restaurant,
    restaurant => restaurant.category,
  )
  restaurants: Restaurant[];
}
