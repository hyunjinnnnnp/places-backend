import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { PlaceUserRelation } from '../entities/place-user-relation.entity';

@InputType()
export class GetPlaceUserRelationDetailInput {
  @Field((type) => Number)
  relationId: number;
}

@ObjectType()
export class GetPlaceUserRelationDetailOutput extends CoreOutput {
  @Field((type) => PlaceUserRelation, { nullable: true })
  relation?: PlaceUserRelation;
}
