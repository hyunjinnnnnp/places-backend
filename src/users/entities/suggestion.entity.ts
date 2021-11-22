import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@InputType('SuggestionInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Suggestion extends CoreEntity {
  @Field((type) => Number, { nullable: true })
  @Column({ nullable: true })
  placeId?: number;

  @Field((type) => String, { defaultValue: 'herehere' })
  @Column({ default: 'herehere' })
  message: string;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.receivers)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.senders)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Field((type) => Number)
  @Column()
  receiverId: number;

  @Field((type) => Number)
  @Column()
  senderId: number;
}
