import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';
import { Place } from 'src/places/entities/place.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@InputType('RelationInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Relation {
  @PrimaryGeneratedColumn()
  @Field((type) => Number)
  id: number;

  @Field((type) => Place)
  @ManyToOne((type) => Place, (place) => place.relations, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'placeId' })
  place: Place;

  @Column()
  placeId: number;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.relations, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  memo?: string;

  @Field((type) => Boolean)
  @Column({ default: false })
  @IsBoolean()
  isLiked: boolean;

  @Field((type) => Boolean)
  @Column({ default: false })
  @IsBoolean()
  isVisited: boolean;
}
