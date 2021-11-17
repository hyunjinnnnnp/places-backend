import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { PlaceUserRelation } from 'src/place-user-relations/entities/place-user-relation.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Category } from './category.entity';

@InputType('PlacesInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Place extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  address: string;

  @Field((type) => String)
  @Column()
  @IsString()
  coverImg: string;

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
}
