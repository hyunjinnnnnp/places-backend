import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@InputType('FollowInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Follow extends CoreEntity {
  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.following, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'followingId',
  })
  following: User;

  @Field((type) => Number)
  @Column()
  followingId: number;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.followers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'followerId',
  })
  follower: User;

  @Field((type) => Number)
  @Column()
  followerId: number;

  // @Field((type) => Boolean)
  // @Column({ default: false })
  // isChecked: boolean;
}
