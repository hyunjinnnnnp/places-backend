import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { PlaceUserRelation } from '../entities/place-user-relation.entity';

@InputType()
export class EditIsLikedInput extends PickType(PlaceUserRelation, ['isLiked']) {
  @Field((type) => Number)
  kakaoPlaceId: number;
}
@ObjectType()
export class EditIsLikedOutput extends CoreOutput {
  @Field((type) => Number, { nullable: true })
  relationId?: number;
}
