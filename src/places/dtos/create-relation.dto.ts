import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Relation } from 'src/common/entities/relation.entity';

@InputType()
export class CreateRelationInput {
  @Field((type) => Number)
  userId: number;

  @Field((type) => Number)
  placeId: number;

  @Field((type) => String, { nullable: true })
  memo?: string;
}

@ObjectType()
export class CreateRelationOutput extends CoreOutput {
  @Field((type) => Relation, { nullable: true })
  relation?: Relation;
}
