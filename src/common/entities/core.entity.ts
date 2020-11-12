import { Field, ObjectType } from '@nestjs/graphql';
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class CoreEntity {
  @Field(type => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(type => Date)
  @CreateDateColumn()
  createAt: Date;

  @Field(type => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
