import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { PlaceUserRelation } from '../entities/place-user-relation.entity';

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
  @Field((type) => PlaceUserRelation, { nullable: true })
  relation?: PlaceUserRelation;
}
