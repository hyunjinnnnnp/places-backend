import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Relation } from 'src/common/entities/relation.entity';
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

  @Field((type) => [Relation], { nullable: true })
  @OneToMany((type) => Relation, (relation) => relation.place, {
    nullable: true,
  })
  relations?: Relation[];

  @Field((type) => Category, { nullable: true })
  @ManyToOne((type) => Category, (category) => category.places, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category?: Category;
}
