import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Place } from 'src/places/entities/place.entity';

@InputType()
export class CreatePlaceUserRelationInput extends PickType(Place, [
  'name',
  'address',
  'lat',
  'lng',
  'phone',
  'url',
  'kakaoPlaceId',
]) {
  @Field((type) => String, { nullable: true })
  categoryName?: string;

  @Field((type) => String, { nullable: true })
  memo?: string;
}

@ObjectType()
export class CreatePlaceUserRelationOutput extends CoreOutput {}
