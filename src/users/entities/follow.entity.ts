import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Follow extends CoreEntity {
  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.following)
  following: User;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.followers)
  follower: User;

  @Field((type) => Boolean, { defaultValue: false })
  isChecked: boolean;
}
