import { Field, InputType, ObjectType, OmitType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Place } from '../entities/place.entity';

@InputType()
export class CreatePlaceInput extends OmitType(Place, [
  'relations',
  'categoryId',
  'suggestions',
  'id',
  'createdAt',
  'updatedAt',
]) {
  @Field((type) => String, { nullable: true })
  categoryName?: string;
}

@ObjectType()
export class CreatePlaceOutput extends CoreOutput {
  @Field((type) => Number, { nullable: true })
  placeId?: number;
}
