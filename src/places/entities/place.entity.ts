import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { PlaceUserRelation } from 'src/place-user-relations/entities/place-user-relation.entity';
import { Suggestion } from 'src/users/entities/suggestion.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Category } from './category.entity';

@InputType('PlacesInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Place extends CoreEntity {
  @Field((type) => Number)
  @Column()
  @IsNumber()
  kakaoPlaceId: number;

  @Field((type) => String)
  @Column()
  @IsString()
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  address: string;

  @Field((type) => Number)
  @Column({ type: 'numeric', precision: 15, scale: 13 })
  @IsNumber()
  lat: number;

  @Field((type) => Number)
  @Column({ type: 'numeric', precision: 15, scale: 12 })
  @IsNumber()
  lng: number;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  phone?: string;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  url?: string;

  @Field((type) => [PlaceUserRelation], { nullable: true })
  @OneToMany((type) => PlaceUserRelation, (relation) => relation.place, {
    nullable: true,
  })
  relations?: PlaceUserRelation[];

  @Field((type) => Category, { nullable: true })
  @ManyToOne((type) => Category, (category) => category.places, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category?: Category;

  @Field((type) => Number, { nullable: true })
  @Column()
  categoryId?: number;

  @Field((type) => [Suggestion], { nullable: true })
  @OneToMany((type) => Suggestion, (suggestion) => suggestion.place, {
    nullable: true,
  })
  suggestions?: Suggestion[];
}
