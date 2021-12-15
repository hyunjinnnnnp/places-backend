import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/users/entities/user.entity';
import {
  CreatePlaceUserRelationInput,
  CreatePlaceUserRelationOutput,
} from './dtos/create-place-user-relation.dto';
import {
  DeletePlaceUserRelationInput,
  DeletePlaceUserRelationOutput,
} from './dtos/delete-place-user-relation.dto';
import { EditIsLikedInput, EditIsLikedOutput } from './dtos/edit-is-liked.dto';
import {
  EditIsVisitedInput,
  EditIsVisitedOutput,
} from './dtos/edit-is-visited.dto';
import { EditMemoInput, EditMemoOutput } from './dtos/edit-memo.dto';
import {
  FindMyPlacesByMemoInput,
  FindMyPlacesByMemoOutput,
} from './dtos/find-place-user-relations-by-memo.dto';
import {
  GetMyPlaceRelationsPaginatedInput,
  GetMyPlaceRelationsPaginatedOutput,
} from './dtos/get-my-place-relations-paginated.dto';
import { GetMyPlaceRelationsOutput } from './dtos/get-my-place-relations.dto';
import {
  GetPlaceUserRelationDetailInput,
  GetPlaceUserRelationDetailOutput,
} from './dtos/get-place-user-relation-detail.dto';
import {
  GetPlaceUserRelationsByIdInput,
  GetPlaceUserRelationsByIdOutput,
} from './dtos/get-place-user-relations.dto';
import {
  SearchPlaceUserRelationInput,
  SearchPlaceUserRelationOutput,
} from './dtos/search-place-user-relations.dto';
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
  ): Promise<GetMyPlaceRelationsOutput> {
    return this.placeUserRelationsService.getMyPlaceRelations(user);
  }

  @UseGuards(AuthGuard)
  @Query((returns) => GetMyPlaceRelationsPaginatedOutput)
  getMyPlaceRelationsPaginated(
    @AuthUser() user: User,
    @Args('input')
    getMyPlaceRelationsPaginatedInput: GetMyPlaceRelationsPaginatedInput,
  ): Promise<GetMyPlaceRelationsPaginatedOutput> {
    return this.placeUserRelationsService.getMyPlaceRelationsPaginated(
      user,
      getMyPlaceRelationsPaginatedInput,
    );
  }

  @UseGuards(AuthGuard)
  @Query((returns) => FindMyPlacesByMemoOutput)
  findMyPlaceRelationsByMemo(
    findMyPlacesByMemoInput: FindMyPlacesByMemoInput,
  ): Promise<FindMyPlacesByMemoOutput> {
    return this.placeUserRelationsService.findMyPlacesByMemo(
      findMyPlacesByMemoInput,
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
  @Mutation((returns) => EditIsLikedOutput)
  editIsLiked(
    @AuthUser() authUser: User,
    @Args('input') editIsLikedInput: EditIsLikedInput,
  ): Promise<EditIsLikedOutput> {
    return this.placeUserRelationsService.editIsLiked(
      authUser,
      editIsLikedInput,
    );
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => EditIsVisitedOutput)
  editIsVisited(
    @AuthUser() authUser: User,
    @Args('input') editIsVisitedInput: EditIsVisitedInput,
  ): Promise<EditIsVisitedOutput> {
    return this.placeUserRelationsService.editIsVisited(
      authUser,
      editIsVisitedInput,
    );
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => EditMemoOutput)
  editMemo(
    @AuthUser() authUser: User,
    @Args('input') editMemoInput: EditMemoInput,
  ): Promise<EditMemoOutput> {
    return this.placeUserRelationsService.editMemo(authUser, editMemoInput);
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
