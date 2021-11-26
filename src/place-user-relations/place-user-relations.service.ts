import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.pagination';
import { Category } from 'src/places/entities/category.entity';
import { Place } from 'src/places/entities/place.entity';
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
import {
  EditPlaceUserRelationInput,
  EditPlaceUserRelationOutput,
} from './dtos/edit-place-user-relation.dto';
import {
  GetMyPlaceRelationsInput,
  GetMyPlaceRelationsOutput,
} from './dtos/get-my-place-relations.dto';
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
  ) {}

  async getMyPlaceRelations(
    user: User,
    { page }: GetMyPlaceRelationsInput,
  ): Promise<GetMyPlaceRelationsOutput> {
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
      const { placeId } = createPlaceUserRelationInput;
      const place = await this.places.findOne(placeId);
      if (!place) {
        return {
          ok: false,
          error: 'Place id not found',
        };
      }
      const relation = await this.placeUserRelations.findOne({
        userId: user.id,
        placeId,
      });
      if (relation) {
        return { ok: false, error: 'relation already exists' };
      }
      const newRelation = await this.placeUserRelations.save(
        this.placeUserRelations.create({
          ...createPlaceUserRelationInput,
          user,
        }),
      );
      return { ok: true, relation: newRelation };
    } catch {
      return { ok: false, error: 'Could not create' };
    }
  }

  async editPlaceUserRelation(
    authUser: User,
    editPlaceUserRelationInput: EditPlaceUserRelationInput,
  ): Promise<EditPlaceUserRelationOutput> {
    try {
      const { relationId } = editPlaceUserRelationInput;
      const relation = await this.placeUserRelations.findOne(relationId);
      if (!relation) {
        return { ok: false, error: 'Relation not found' };
      }
      if (authUser.id !== relation.userId) {
        return { ok: false, error: "Could not edit somebody else's relation" };
      }
      await this.placeUserRelations.save({
        id: relationId,
        ...editPlaceUserRelationInput,
      });
      return {
        ok: true,
      };
    } catch {
      return { ok: false, error: 'Could not edit' };
    }
  }

  async deletePlaceUserRelation(
    user: User,
    { relationId }: DeletePlaceUserRelationInput,
  ): Promise<DeletePlaceUserRelationOutput> {
    //if place doesn't exist anymore ?
    //should notice, then delete
    try {
      const relation = await this.placeUserRelations.findOne(relationId);
      if (!relation) {
        return { ok: false, error: 'Relation not found' };
      }
      if (relation.userId !== user.id) {
        return {
          ok: false,
          error: "cannot delete somebodyelse's relation",
        };
      }
      await this.placeUserRelations.delete(relationId);

      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not delete' };
    }
  }
}
