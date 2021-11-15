import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class EditRelationInput {
  @Field((type) => Number)
  relationId: number;

  @Field((type) => String, { nullable: true })
  memo?: string;

  @Field((type) => Boolean, { nullable: true })
  isLiked?: boolean;

  @Field((type) => Boolean, { nullable: true })
  isVisited?: boolean;
}

@ObjectType()
export class EditRelationOutput extends CoreOutput {}
