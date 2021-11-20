import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@InputType('FollowInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Follow extends CoreEntity {
  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.following, { onDelete: 'SET NULL' })
  following: User;

  @Field((type) => Number)
  @Column()
  followingId: number;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.followers, { onDelete: 'SET NULL' })
  follower: User;

  @Field((type) => Number)
  @Column()
  followerId: number;

  @Field((type) => Boolean, { defaultValue: false })
  @Column()
  isChecked: boolean;
}
