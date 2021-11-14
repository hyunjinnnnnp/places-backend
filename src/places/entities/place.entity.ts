import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
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

  @Field((type) => Boolean)
  @Column({ default: false })
  @IsBoolean()
  isVisited: boolean;

  @Field((type) => Category, { nullable: true })
  @ManyToOne((type) => Category, (category) => category.places, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category?: Category;

  @Field((type) => [User])
  @ManyToMany((type) => User, (user) => user.places, { cascade: true })
  @JoinTable()
  users: User[];
}
