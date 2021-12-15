import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { PlaceUserRelation } from '../entities/place-user-relation.entity';

@InputType()
export class EditMemoInput extends PickType(PlaceUserRelation, ['memo']) {
  @Field((type) => Number)
  kakaoPlaceId: number;
}
@ObjectType()
export class EditMemoOutput extends CoreOutput {
  @Field((type) => Number, { nullable: true })
  relationId?: number;
}
