import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ObjectType()
export class Place {
  @Field((type) => String)
  @IsString()
  name: string;

  @Field((type) => String)
  @IsString()
  address: string;

  @Field((type) => String, { nullable: true })
  @IsString()
  phone?: string;

  @Field((type) => String, { nullable: true })
  @IsString()
  info?: string;

  // @Field(type=> Category, {nullable: true})
  // @Field(type=> Boolean) //default false
  // isChecked
}
