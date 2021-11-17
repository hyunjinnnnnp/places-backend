import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/users/entities/user.entity';
import {
  CreateRelationInput,
  CreateRelationOutput,
} from './dtos/create-relation.dto';
import {
  DeleteRelationInput,
  DeleteRelationOutput,
} from './dtos/delete-relation.dto';
import {
  EditRelationInput,
  EditRelationOutput,
} from './dtos/edit-relation.dto';
import {
  GetUserRelationsInput,
  GetUserRelationsOutput,
} from './dtos/get-user-relations.dto';
import { PlaceUserRelationsService } from './place-user-relations.service';

@Resolver()
export class PlaceUserRelationsResolver {
  constructor(
    private readonly placeUserRelationsService: PlaceUserRelationsService,
  ) {}

  @Query((returns) => GetUserRelationsOutput)
  getUserRelations(
    @Args('input') getUserRelationsInput: GetUserRelationsInput,
  ): Promise<GetUserRelationsOutput> {
    return this.placeUserRelationsService.getUserRelations(
      getUserRelationsInput,
    );
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => CreateRelationOutput)
  createRelation(
    @Args('input') createRelationInput: CreateRelationInput,
  ): Promise<CreateRelationOutput> {
    return this.placeUserRelationsService.createRelation(createRelationInput);
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => EditRelationOutput)
  editRelation(
    @AuthUser() authUser: User,
    @Args('input') editRelationInput: EditRelationInput,
  ): Promise<EditRelationOutput> {
    return this.placeUserRelationsService.editRelation(
      authUser,
      editRelationInput,
    );
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => DeleteRelationOutput)
  deleteRelation(
    @AuthUser() user: User,
    @Args('input') deleteRelationInput: DeleteRelationInput,
  ): Promise<DeleteRelationOutput> {
    return this.placeUserRelationsService.deleteRelation(
      user,
      deleteRelationInput,
    );
  }
}
