import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { PlaceUserRelation } from '../entities/place-user-relation.entity';

@InputType()
export class FindMyPlacesByMemoInput {
  @Field((type) => String)
  query: string;
}

@ObjectType()
export class FindMyPlacesByMemoOutput extends CoreOutput {
  @Field((type) => [PlaceUserRelation], { nullable: true })
  relations?: PlaceUserRelation[];
}
