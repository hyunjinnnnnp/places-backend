import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { PlaceUserRelation } from '../entities/place-user-relation.entity';

@InputType()
export class GetUserRelationsInput {
  @Field((type) => Number)
  userId: number;
}

@ObjectType()
export class GetUserRelationsOutput extends CoreOutput {
  @Field((type) => [PlaceUserRelation], { nullable: true })
  relations?: PlaceUserRelation[];
}
