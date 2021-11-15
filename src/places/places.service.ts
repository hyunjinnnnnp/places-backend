import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Relation } from 'src/common/entities/relation.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
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

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place) private readonly places: Repository<Place>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Relation)
    private readonly relations: Repository<Relation>,
  ) {}
  async createPlace(
    createPlaceInput: CreatePlaceInput,
  ): Promise<CreatePlaceOutput> {
    try {
      const place = this.places.create(createPlaceInput);
      await this.places.save(place);
      return { ok: true, place };
    } catch (error) {
      console.log(error);
      return { ok: false, error: 'Could not create' };
    }
  }
  async createRelation(
    createRelationInput: CreateRelationInput,
  ): Promise<CreateRelationOutput> {
    try {
      const relation = this.relations.create(createRelationInput);
      await this.relations.save(relation);
      return { ok: true, relation };
    } catch {
      return { ok: false, error: 'Could not create' };
    }
  }
  async editRelation(
    editRelationInput: EditRelationInput,
  ): Promise<EditRelationOutput> {
    try {
      const relation = await this.relations.findOne(
        editRelationInput.relationId,
      );
      if (!relation) {
        return { ok: false, error: 'Relation not found' };
      }
      await this.relations.save({
        id: editRelationInput.relationId,
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
    try {
      const relation = await this.relations.findOne(relationId);
      if (!relation) {
        return { ok: false, error: 'Relation not found' };
      }
      if (relation.userId !== user.id) {
        return {
          ok: false,
          error: "You can't delete a relation you don't own",
        };
      }
      await this.relations.delete(relationId);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not delete' };
    }
  }
  async getUserRelations({
    userId,
  }: GetUserRelationsInput): Promise<GetUserRelationsOutput> {
    try {
      const relations = await this.relations.find({ userId });
      return { ok: true, relations };
    } catch {
      return { ok: false, error: 'Could not load relations' };
    }
  }
}
