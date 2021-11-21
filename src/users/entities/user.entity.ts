import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import * as bcrypt from 'bcrypt';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsString } from 'class-validator';
import { PlaceUserRelation } from 'src/place-user-relations/entities/place-user-relation.entity';
import { Follow } from '../../follows/entities/follow.entity';

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsEmail()
  email: string;

  @Field((type) => String)
  @Column({ select: false })
  @IsString()
  password: string;

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
    //팔로우 생성과 반대
    //user가 follower로써 상대를 추가한다. >> 그 팔로우 내역을 following[]에 저장한다.
    nullable: true,
    onDelete: 'SET NULL',
  })
  following?: Follow[];

  @Field((type) => [Follow], { nullable: true })
  @OneToMany((type) => Follow, (follow) => follow.following, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  followers?: Follow[];

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
