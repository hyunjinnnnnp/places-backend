import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Relation } from 'src/common/entities/relation.entity';
import { User } from 'src/users/entities/user.entity';
import { CreatePlaceInput, CreatePlaceOutput } from './dtos/create-place.dto';
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
} from './dtos/edit-relation-dto';
import {
  GetUserRelationsInput,
  GetUserRelationsOutput,
} from './dtos/get-user-relations.dto';
import { Place } from './entities/place.entity';
import { PlacesService } from './places.service';

@Resolver((of) => Place)
export class PlacesResolver {
  constructor(private readonly placesService: PlacesService) {}

  @UseGuards(AuthGuard)
  @Mutation((returns) => CreatePlaceOutput)
  createPlace(
    @Args('input') createPlaceInput: CreatePlaceInput,
  ): Promise<CreatePlaceOutput> {
    return this.placesService.createPlace(createPlaceInput);
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => CreateRelationOutput)
  createRelation(
    @Args('input') createRelationInput: CreateRelationInput,
  ): Promise<CreateRelationOutput> {
    return this.placesService.createRelation(createRelationInput);
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => EditRelationOutput)
  editRelation(
    @Args('input') editRelationInput: EditRelationInput,
  ): Promise<EditRelationOutput> {
    return this.placesService.editRelation(editRelationInput);
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => DeleteRelationOutput)
  deleteRelation(
    @AuthUser() user: User,
    @Args('input') deleteRelationInput: DeleteRelationInput,
  ): Promise<DeleteRelationOutput> {
    return this.placesService.deleteRelation(user, deleteRelationInput);
  }

  @Query((returns) => GetUserRelationsOutput)
  getUserRelations(
    @Args('input') getUserRelationsInput: GetUserRelationsInput,
  ): Promise<GetUserRelationsOutput> {
    return this.placesService.getUserRelations(getUserRelationsInput);
  }
}
