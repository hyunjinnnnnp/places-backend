import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Place } from 'src/places/entities/place.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@InputType('PlaceUserRelationInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class PlaceUserRelation extends CoreEntity {
  @Field((type) => Place)
  @ManyToOne((type) => Place, (place) => place.relations, {
    onDelete: 'SET NULL',
  })
  place: Place;

  @Field((type) => Number)
  @Column()
  placeId: number;

  @Field((type) => Number)
  @Column()
  kakaoPlaceId: number;

  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.relations, { onDelete: 'SET NULL' })
  user: User; //if relation deleted, user also deleted (on user.relations)

  @Field((type) => Number)
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
