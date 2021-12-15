import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { PlaceUserRelation } from '../entities/place-user-relation.entity';

@InputType()
export class EditIsVisitedInput extends PickType(PlaceUserRelation, [
  'isVisited',
]) {
  @Field((type) => Number)
  kakaoPlaceId: number;
}
@ObjectType()
export class EditIsVisitedOutput extends CoreOutput {
  @Field((type) => Number, { nullable: true })
  relationId?: number;
}
