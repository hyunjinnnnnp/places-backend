import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Relation } from 'src/common/entities/relation.entity';

@InputType()
export class GetUserRelationsInput {
  @Field((type) => Number)
  userId: number;
}

@ObjectType()
export class GetUserRelationsOutput extends CoreOutput {
  @Field((type) => [Relation], { nullable: true })
  relations?: Relation[];
}
