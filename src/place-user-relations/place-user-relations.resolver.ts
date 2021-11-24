import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/users/entities/user.entity';
import {
  CreatePlaceUserRelationInput,
  CreatePlaceUserRelationOutput,
} from './dtos/create-relation.dto';
import {
  DeletePlaceUserRelationInput,
  DeletePlaceUserRelationOutput,
} from './dtos/delete-relation.dto';
import {
  EditPlaceUserRelationInput,
  EditPlaceUserRelationOutput,
} from './dtos/edit-relation.dto';
import {
  GetMyPlaceRelationsInput,
  GetMyPlaceRelationsOutput,
} from './dtos/get-my-relations.dto';
import {
  GetPlaceUserRelationDetailInput,
  GetPlaceUserRelationDetailOutput,
} from './dtos/get-place-user-relation-detail.dto';
import {
  GetPlaceUserRelationsByIdInput,
  GetPlaceUserRelationsByIdOutput,
} from './dtos/get-user-relations.dto';
import {
  SearchPlaceUserRelationInput,
  SearchPlaceUserRelationOutput,
} from './dtos/search-user-relations.dto';
import { PlaceUserRelation } from './entities/place-user-relation.entity';
import { PlaceUserRelationsService } from './place-user-relations.service';

@Resolver((of) => PlaceUserRelation)
export class PlaceUserRelationsResolver {
  constructor(
    private readonly placeUserRelationsService: PlaceUserRelationsService,
  ) {}

  @UseGuards(AuthGuard)
  @Query((returns) => GetMyPlaceRelationsOutput)
  getMyPlaceRelations(
    @AuthUser() user: User,
    @Args('input') getMyPlaceRelationsInput: GetMyPlaceRelationsInput,
  ): Promise<GetMyPlaceRelationsOutput> {
    return this.placeUserRelationsService.getMyPlaceRelations(
      user,
      getMyPlaceRelationsInput,
    );
  }

  @Query((returns) => GetPlaceUserRelationsByIdOutput)
  getPlaceUserRelationsByUserId(
    @Args('input') getPlaceUserRelationsInput: GetPlaceUserRelationsByIdInput,
  ): Promise<GetPlaceUserRelationsByIdOutput> {
    return this.placeUserRelationsService.getPlaceUserRelationsByUserId(
      getPlaceUserRelationsInput,
    );
  }

  @Query((returns) => GetPlaceUserRelationDetailOutput)
  getPlaceUserRelationDetail(
    @Args('input')
    getPlaceUserRelationDetailInput: GetPlaceUserRelationDetailInput,
  ): Promise<GetPlaceUserRelationDetailOutput> {
    return this.placeUserRelationsService.getPlaceUserRelationDetail(
      getPlaceUserRelationDetailInput,
    );
  }

  @UseGuards(AuthGuard)
  @Query((returns) => SearchPlaceUserRelationOutput)
  searchPlaceUserRelationByName(
    @AuthUser() authUser: User,
    @Args('input') searchPlaceUserRelationInput: SearchPlaceUserRelationInput,
  ): Promise<SearchPlaceUserRelationOutput> {
    return this.placeUserRelationsService.searchPlaceUserRelationByName(
      authUser,
      searchPlaceUserRelationInput,
    );
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => CreatePlaceUserRelationOutput)
  createPlaceUserRelation(
    @AuthUser() authUser: User,
    @Args('input') createPlaceUserRelationInput: CreatePlaceUserRelationInput,
  ): Promise<CreatePlaceUserRelationOutput> {
    return this.placeUserRelationsService.createPlaceUserRelation(
      authUser,
      createPlaceUserRelationInput,
    );
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => EditPlaceUserRelationOutput)
  editPlaceUserRelation(
    @AuthUser() authUser: User,
    @Args('input') editPlaceUserRelationInput: EditPlaceUserRelationInput,
  ): Promise<EditPlaceUserRelationOutput> {
    return this.placeUserRelationsService.editPlaceUserRelation(
      authUser,
      editPlaceUserRelationInput,
    );
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => DeletePlaceUserRelationOutput)
  deletePlaceUserRelation(
    @AuthUser() user: User,
    @Args('input') deletePlaceUserRelationInput: DeletePlaceUserRelationInput,
  ): Promise<DeletePlaceUserRelationOutput> {
    return this.placeUserRelationsService.deletePlaceUserRelation(
      user,
      deletePlaceUserRelationInput,
    );
  }
}
