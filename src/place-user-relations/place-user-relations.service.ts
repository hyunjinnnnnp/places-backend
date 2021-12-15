import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.pagination';
import { Category } from 'src/places/entities/category.entity';
import { Place } from 'src/places/entities/place.entity';
import { CategoryRepository } from 'src/places/repositories/category.repository';
import { User } from 'src/users/entities/user.entity';
import { ILike, Repository } from 'typeorm';
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

@Injectable()
export class PlaceUserRelationsService {
  constructor(
    @InjectRepository(PlaceUserRelation)
    private readonly placeUserRelations: Repository<PlaceUserRelation>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Place) private readonly places: Repository<Place>,
    @InjectRepository(Category)
    private readonly paginate: Pagination,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async getMyPlaceRelations(user: User) {
    try {
      const relations = await this.placeUserRelations.find({
        where: { userId: user.id },
        relations: ['place'],
      });
      return { ok: true, relations };
    } catch {
      return { ok: false, error: 'Could not load' };
    }
  }

  async getMyPlaceRelationsPaginated(
    user: User,
    { page }: GetMyPlaceRelationsPaginatedInput,
  ): Promise<GetMyPlaceRelationsPaginatedOutput> {
    try {
      const [relations, totalResults] = await this.paginate.getResults(
        this.placeUserRelations,
        page,
        {
          user,
        },
      );
      const totalPages = await this.paginate.getTotalPages(totalResults);
      return {
        ok: true,
        relations,
        totalResults,
        totalPages,
      };
    } catch {
      return { ok: false, error: 'Could not load' };
    }
  }

  async findMyPlacesByMemo({
    query,
  }: FindMyPlacesByMemoInput): Promise<FindMyPlacesByMemoOutput> {
    try {
      const relations = await this.placeUserRelations.find({
        where: {
          memo: ILike(`%${query}%`),
        },
      });
      return { ok: true, relations };
    } catch {
      return { ok: false, error: 'Could not load' };
    }
  }

  async getPlaceUserRelationsByUserId({
    userId,
    page,
  }: GetPlaceUserRelationsByIdInput): Promise<GetPlaceUserRelationsByIdOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (!user) {
        return { ok: false, error: "User id doesn't exist" };
      }
      const [relations, totalResults] = await this.paginate.getResults(
        this.placeUserRelations,
        page,
        {
          user,
        },
      );
      const totalPages = await this.paginate.getTotalPages(totalResults);
      return {
        ok: true,
        relations,
        totalResults,
        totalPages,
      };
    } catch {
      return { ok: false, error: 'Could not load relations' };
    }
  }

  async getPlaceUserRelationDetail({
    relationId,
  }: GetPlaceUserRelationDetailInput): Promise<GetPlaceUserRelationDetailOutput> {
    try {
      const relation = await this.placeUserRelations.findOne(relationId, {
        relations: ['place'],
      });
      if (!relation) {
        return { ok: false, error: 'Relation not found' };
      }
      return { ok: true, relation };
    } catch {
      return { ok: false, error: 'Could not load' };
    }
  }

  async searchPlaceUserRelationByName(
    user: User,
    { page, query }: SearchPlaceUserRelationInput,
  ): Promise<SearchPlaceUserRelationOutput> {
    try {
      const findOptions = {
        relations: ['place'],
        where: {
          user,
          place: {
            name: ILike(`%${query}%`),
          },
        },
      };
      const [relations, totalResults] = await this.paginate.getResults(
        this.placeUserRelations,
        page,
        findOptions,
      );
      const totalPages = await this.paginate.getTotalPages(totalResults);
      return {
        ok: true,
        relations,
        totalResults,
        totalPages,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load',
      };
    }
  }

  async createPlaceUserRelation(
    user: User,
    createPlaceUserRelationInput: CreatePlaceUserRelationInput,
  ): Promise<CreatePlaceUserRelationOutput> {
    try {
      let place: Place = await this.places.findOne({
        kakaoPlaceId: createPlaceUserRelationInput.kakaoPlaceId,
      });
      // if !exists create place
      if (!place) {
        const newPlace = await this.places.create({
          kakaoPlaceId: createPlaceUserRelationInput.kakaoPlaceId,
          name: createPlaceUserRelationInput.name,
          address: createPlaceUserRelationInput.address,
          phone: createPlaceUserRelationInput.phone,
          url: createPlaceUserRelationInput.url,
          lat: createPlaceUserRelationInput.lat,
          lng: createPlaceUserRelationInput.lng,
        });
        place = newPlace;
        if (createPlaceUserRelationInput.categoryName) {
          const category = await this.categoryRepository.getOrCreate(
            createPlaceUserRelationInput.categoryName,
          );
          place.category = category;
        }
        await this.places.save(place);
      }
      const relation = await this.placeUserRelations.findOne({
        userId: user.id,
        placeId: place.id,
      });
      if (relation) {
        return { ok: false, error: 'relation already exists' };
      }
      const newRelation = await this.placeUserRelations.save(
        this.placeUserRelations.create({
          place,
          user,
          kakaoPlaceId: place.kakaoPlaceId,
          memo: createPlaceUserRelationInput.memo,
        }),
      );
      return { ok: true, relation: newRelation };
    } catch {
      return { ok: false, error: 'Could not create' };
    }
  }

  async editIsLiked(
    authUser: User,
    { kakaoPlaceId, isLiked }: EditIsLikedInput,
  ): Promise<EditIsLikedOutput> {
    try {
      const relation = await this.placeUserRelations.findOne({
        userId: authUser.id,
        kakaoPlaceId,
      });
      if (!relation) {
        return { ok: false, error: 'Relation not found' };
      }
      if (typeof isLiked === 'boolean') {
        await this.placeUserRelations.save({
          ...relation,
          isLiked,
        });
      }
      return {
        ok: true,
        relationId: relation.id,
      };
    } catch {
      return { ok: false, error: 'Could not edit' };
    }
  }

  async editIsVisited(
    authUser: User,
    { kakaoPlaceId, isVisited }: EditIsVisitedInput,
  ): Promise<EditIsVisitedOutput> {
    try {
      const relation = await this.placeUserRelations.findOne({
        userId: authUser.id,
        kakaoPlaceId,
      });
      if (!relation) {
        return { ok: false, error: 'Relation not found' };
      }
      if (typeof isVisited === 'boolean') {
        await this.placeUserRelations.save({
          ...relation,
          isVisited,
        });
      }
      return {
        ok: true,
        relationId: relation.id,
      };
    } catch {
      return { ok: false, error: 'Could not edit' };
    }
  }

  async editMemo(
    authUser: User,
    { kakaoPlaceId, memo }: EditMemoInput,
  ): Promise<EditMemoOutput> {
    try {
      const relation = await this.placeUserRelations.findOne({
        userId: authUser.id,
        kakaoPlaceId,
      });
      if (!relation) {
        return { ok: false, error: 'Relation not found' };
      }
      if (memo) {
        await this.placeUserRelations.save({
          ...relation,
          memo,
        });
      }
      return {
        ok: true,
        relationId: relation.id,
      };
    } catch {
      return { ok: false, error: 'Could not edit' };
    }
  }

  async deletePlaceUserRelation(
    user: User,
    { kakaoPlaceId }: DeletePlaceUserRelationInput,
  ): Promise<DeletePlaceUserRelationOutput> {
    try {
      const relation = await this.placeUserRelations.findOne({
        userId: user.id,
        kakaoPlaceId,
      });
      if (!relation) {
        return { ok: false, error: 'Relation not found' };
      }
      await this.placeUserRelations.delete(relation.id);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not delete' };
    }
  }
}
