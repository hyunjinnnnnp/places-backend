import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.pagination';
import { Place } from 'src/places/entities/place.entity';
import { User } from 'src/users/entities/user.entity';
import { ILike, Repository } from 'typeorm';
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
import {
  SearchUserRelationInput,
  SearchUserRelationOutput,
} from './dtos/search-user-relations.dto';
import { PlaceUserRelation } from './entities/place-user-relation.entity';

@Injectable()
export class PlaceUserRelationsService {
  constructor(
    @InjectRepository(PlaceUserRelation)
    private readonly relations: Repository<PlaceUserRelation>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Place) private readonly places: Repository<Place>,
    private readonly paginate: Pagination,
  ) {}

  async getUserRelations({
    userId,
    page,
  }: GetUserRelationsInput): Promise<GetUserRelationsOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (!user) {
        return { ok: false, error: "User id doesn't exist" };
      }
      const [relations, totalResults] = await this.paginate.getResults(
        this.relations,
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

  async searchUserRelationByName({
    page,
    query,
    userId,
  }: SearchUserRelationInput): Promise<SearchUserRelationOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (!user) {
        return { ok: false, error: 'User not found' };
      }
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
        this.relations,
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

  async createRelation(
    createRelationInput: CreateRelationInput,
  ): Promise<CreateRelationOutput> {
    try {
      const { userId, placeId } = createRelationInput;
      const user = await this.users.findOne(userId);
      if (!user) {
        return {
          ok: false,
          error: 'User id not found',
        };
      }
      const place = await this.places.findOne(placeId);
      if (!place) {
        return {
          ok: false,
          error: 'Place id not found',
        };
      }
      const relation = await this.relations.findOne({
        userId,
        placeId,
      });
      if (relation) {
        return { ok: false, error: 'relation already exists' };
      }
      const newRelation = await this.relations.save(
        this.relations.create(createRelationInput),
      );
      return { ok: true, relation: newRelation };
    } catch {
      return { ok: false, error: 'Could not create' };
    }
  }

  async editRelation(
    authUser: User,
    editRelationInput: EditRelationInput,
  ): Promise<EditRelationOutput> {
    try {
      const { relationId } = editRelationInput;
      const relation = await this.relations.findOne(relationId);
      if (!relation) {
        return { ok: false, error: 'Relation not found' };
      }
      if (authUser.id !== relation.userId) {
        return { ok: false, error: "Could not edit somebody else's relation" };
      }
      await this.relations.save({
        id: relationId,
        ...editRelationInput,
      });
      return {
        ok: true,
      };
    } catch {
      return { ok: false, error: 'Could not edit' };
    }
  }
  async deleteRelation(
    user: User,
    { relationId }: DeleteRelationInput,
  ): Promise<DeleteRelationOutput> {
    //if place doesn't exist anymore ?
    //should notice, then delete
    try {
      const relation = await this.relations.findOne(relationId);
      if (!relation) {
        return { ok: false, error: 'Relation not found' };
      }
      if (relation.userId !== user.id) {
        return {
          ok: false,
          error: "cannot delete somebodyelse's relation",
        };
      }
      await this.relations.delete(relationId);

      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not delete' };
    }
  }
}
