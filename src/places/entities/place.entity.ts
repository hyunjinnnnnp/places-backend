import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Place {
  @PrimaryGeneratedColumn()
  @Field((type) => Int)
  id: number;

  @Field((type) => String)
  @Column()
  @IsString()
  name: string;

  @Field((type) => String)
  @Column()
  @IsString()
  address: string;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  info?: string;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  categoryName?: string;

  @Field((type) => Boolean, { defaultValue: false })
  @Column({ default: false, nullable: true })
  @IsOptional()
  @IsBoolean()
  isChecked: boolean;
}
