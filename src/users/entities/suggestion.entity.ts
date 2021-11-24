import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Place } from 'src/places/entities/place.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@InputType('SuggestionInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Suggestion extends CoreEntity {
  @Field((type) => Number, { nullable: true })
  @ManyToOne((type) => Place, (place) => place.suggestions)
  @JoinColumn({ name: 'placeId' })
  place?: Place;

  @Field((type) => String)
  @Column()
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
  placeId: number;

  @Field((type) => Number)
  @Column()
  receiverId: number;

  @Field((type) => Number)
  @Column()
  senderId: number;
}
