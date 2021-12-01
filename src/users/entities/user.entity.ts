import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import * as bcrypt from 'bcrypt';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsString } from 'class-validator';
import { PlaceUserRelation } from 'src/place-user-relations/entities/place-user-relation.entity';
import { Follow } from '../../follows/entities/follow.entity';
import { Suggestion } from './suggestion.entity';

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsEmail()
  email: string;

  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  nickname: string;

  @Field((type) => String)
  @Column({ select: false })
  @IsString()
  password: string;

  @Field((type) => String, { nullable: true }) //default img url
  @Column({ nullable: true })
  @IsString()
  avatarUrl?: string;

  @Field((type) => Boolean)
  @Column({ default: false })
  @IsBoolean()
  verified: boolean;

  @Field((type) => [PlaceUserRelation], { nullable: true })
  @OneToMany((type) => PlaceUserRelation, (relation) => relation.user, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  relations?: PlaceUserRelation[];

  @Field((type) => [Follow], { nullable: true })
  @OneToMany((type) => Follow, (follow) => follow.follower, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  following?: Follow[];

  @Field((type) => [Follow], { nullable: true })
  @OneToMany((type) => Follow, (follow) => follow.following, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  followers?: Follow[];

  @OneToMany((type) => Suggestion, (suggestion) => suggestion.receiver)
  receivers?: Suggestion[];

  @OneToMany((type) => Suggestion, (suggestion) => suggestion.sender)
  senders?: Suggestion[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
