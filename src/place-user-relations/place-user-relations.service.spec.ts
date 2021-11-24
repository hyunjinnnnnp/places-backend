import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.pagination';
import { Place } from 'src/places/entities/place.entity';
import { User } from 'src/users/entities/user.entity';
import { RelationId, Repository } from 'typeorm';
import { PlaceUserRelation } from './entities/place-user-relation.entity';
import { PlaceUserRelationsService } from './place-user-relations.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});
const mockPagination = () => ({
  getResults: jest.fn(),
  getTotalPages: jest.fn(),
});
describe('PlaceUserRelations', () => {
  type MockRepository<T = any> = Partial<
    Record<keyof Repository<T>, jest.Mock>
  >;
  let service: PlaceUserRelationsService;
  let pagination: Pagination;
  let places: MockRepository<Place>;
  let relations: MockRepository<PlaceUserRelation>;
  let users: MockRepository<User>;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PlaceUserRelationsService,
        {
          provide: Pagination,
          useValue: mockPagination(),
        },
        {
          provide: getRepositoryToken(PlaceUserRelation),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Place),
          useValue: mockRepository(),
        },
      ],
    }).compile();
    service = module.get<PlaceUserRelationsService>(PlaceUserRelationsService);
    pagination = module.get<Pagination>(Pagination);
    places = module.get(getRepositoryToken(Place));
    relations = module.get(getRepositoryToken(PlaceUserRelation));
    users = module.get(getRepositoryToken(User));
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  //   describe('getUserRelations', () => {
  //     const getRelationArgs = { userId: 1, page: 1 };
  //     it('should get places by user id', async () => {
  //       const mockedUser = { id: 1 };
  //       users.findOne.mockResolvedValue(mockedUser);

  //       jest.spyOn(pagination, 'getResults').mockImplementation(async () => {
  //         return [[], getRelationArgs.page];
  //       });
  //       await service.getUserRelations(getRelationArgs);
  //       expect(pagination.getResults).toHaveBeenCalledTimes(1);
  //       expect(pagination.getResults).toHaveBeenCalledWith(
  //         relations,
  //         getRelationArgs.page,
  //         { user: mockedUser },
  //       );
  //     });
  //     it('should fail if user not found', async () => {
  //       users.findOne.mockResolvedValue(null);
  //       const result = await service.getUserRelations(getRelationArgs);
  //       expect(result).toEqual({ ok: false, error: "User id doesn't exist" });
  //     });
  //     it('should fail on exception', async () => {
  //       users.findOne.mockResolvedValue({ id: 1 });
  //       jest.spyOn(pagination, 'getTotalPages').mockRejectedValue(new Error());
  //       const result = await service.getUserRelations(getRelationArgs);
  //       expect(result).toEqual({ ok: false, error: 'Could not load relations' });
  //     });
  //   });

  //   describe('searchUserRelationByName', () => {
  //     const user = {
  //       id: 1,
  //     };
  //     const searchArgs = {
  //       page: 1,
  //       query: 'searchQuery',
  //       userId: user.id,
  //     };
  //     it('should search users relations by query', async () => {
  //       users.findOne.mockResolvedValue(user);

  //       jest.spyOn(pagination, 'getResults').mockImplementation(async () => {
  //         return [[user], searchArgs.page];
  //       });
  //       await service.searchUserRelationByName(searchArgs);
  //       expect(pagination.getResults).toHaveBeenCalledTimes(1);
  //       expect(pagination.getResults).toHaveBeenCalledWith(
  //         relations,
  //         searchArgs.page,
  //         expect.any(Object),
  //       );
  //     });
  //     it('should fail if user not found', async () => {
  //       users.findOne.mockResolvedValue(null);
  //       const result = await service.searchUserRelationByName(searchArgs);
  //       expect(result).toEqual({ ok: false, error: 'User not found' });
  //     });
  //     it('should fail on exception', async () => {
  //       users.findOne.mockResolvedValue(user);
  //       const result = await service.searchUserRelationByName(searchArgs);
  //       jest.spyOn(pagination, 'getTotalPages').mockRejectedValue(new Error());
  //       expect(result).toEqual({
  //         ok: false,
  //         error: 'Could not load',
  //       });
  //     });
  //   });
  //   describe('createRelation', () => {
  //     const user = { id: 1 };
  //     const place = { id: 1 };
  //     const createRelationArgs = {
  //       userId: user.id,
  //       placeId: place.id,
  //     };
  //     it('should create relation', async () => {
  //       users.findOne.mockResolvedValue(user);
  //       places.findOne.mockResolvedValue(place);
  //       relations.findOne.mockResolvedValue(null);
  //       relations.create.mockResolvedValue({});
  //       await service.createRelation(createRelationArgs);
  //       expect(relations.create).toHaveBeenCalledTimes(1);
  //       expect(relations.create).toHaveBeenCalledWith(createRelationArgs);
  //     });
  //     it('should fail if user not found', async () => {
  //       users.findOne.mockResolvedValue(null);
  //       const result = await service.createRelation(createRelationArgs);
  //       expect(result).toEqual({
  //         ok: false,
  //         error: 'User id not found',
  //       });
  //     });
  //     it('should fail if place not found', async () => {
  //       users.findOne.mockResolvedValue(user);
  //       places.findOne.mockResolvedValue(null);
  //       const result = await service.createRelation(createRelationArgs);
  //       expect(result).toEqual({
  //         ok: false,
  //         error: 'Place id not found',
  //       });
  //     });
  //     it('should fail if relation exists', async () => {
  //       users.findOne.mockResolvedValue(user);
  //       places.findOne.mockResolvedValue(place);
  //       relations.findOne.mockResolvedValue({ id: 1 });
  //       const result = await service.createRelation(createRelationArgs);
  //       expect(result).toEqual({
  //         ok: false,
  //         error: 'relation already exists',
  //       });
  //     });
  //     it('should fail on exception', async () => {
  //       users.findOne.mockRejectedValue(new Error());
  //       const result = await service.createRelation(createRelationArgs);
  //       expect(result).toEqual({ ok: false, error: 'Could not create' });
  //     });
  //   });
  //   const authUser = {
  //     id: 1,
  //     email: '',
  //     password: '',
  //     verified: true,
  //     hashPassword: async () => {},
  //     checkPassword: async () => {
  //       return true;
  //     },
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   };
  //   describe('editRelation', () => {
  //     const oldRelation = {
  //       id: 1,
  //       userId: 1,
  //     };
  //     const editRelationArgs = {
  //       relationId: 1,
  //       userId: 1,
  //       input: { memo: '' },
  //     };
  //     it('should edit relation', async () => {
  //       relations.findOne.mockResolvedValue(oldRelation);
  //       relations.save.mockResolvedValue(editRelationArgs);
  //       const result = await service.editRelation(authUser, editRelationArgs);
  //       expect(result).toEqual({ ok: true });
  //       expect(relations.findOne).toHaveBeenCalledTimes(1);
  //       expect(relations.save).toHaveBeenCalledTimes(1);
  //       expect(relations.save).toHaveBeenCalledWith({
  //         id: 1,
  //         ...editRelationArgs,
  //       });
  //     });
  //     it('should fail if relation not found', async () => {
  //       relations.findOne.mockResolvedValue(null);
  //       const result = await service.editRelation(authUser, editRelationArgs);
  //       expect(result).toEqual({ ok: false, error: 'Relation not found' });
  //       expect(relations.findOne).toHaveBeenCalledTimes(1);
  //       expect(relations.findOne).toHaveBeenCalledWith(
  //         editRelationArgs.relationId,
  //       );
  //     });
  //     it('should fail if authUser is not relations owner', async () => {
  //       const FAIL_USER_ID = 2;
  //       relations.findOne.mockResolvedValue({ id: 1, userId: FAIL_USER_ID });
  //       const result = await service.editRelation(authUser, editRelationArgs);
  //       expect(result).toEqual({
  //         ok: false,
  //         error: "Could not edit somebody else's relation",
  //       });
  //     });
  //     it('should fail on exception', async () => {
  //       relations.findOne.mockRejectedValue(new Error());
  //       const result = await service.editRelation(authUser, editRelationArgs);
  //       expect(result).toEqual({ ok: false, error: 'Could not edit' });
  //       expect(relations.findOne).toHaveBeenCalledTimes(1);
  //       expect(relations.findOne).toHaveBeenCalledWith(
  //         editRelationArgs.relationId,
  //       );
  //     });
  //   });
  //   describe('deleteRelation', () => {
  //     const deleteRelationArgs = {
  //       relationId: 1,
  //       userId: 1,
  //     };
  //     const relation = { relationId: 1, userId: 1 };

  //     it('should delete relation', async () => {
  //       relations.findOne.mockResolvedValue(relation);
  //       const result = await service.deleteRelation(authUser, deleteRelationArgs);
  //       expect(result).toEqual({ ok: true });
  //       expect(relations.findOne).toHaveBeenCalledTimes(1);
  //       expect(relations.findOne).toHaveBeenCalledWith(deleteRelationArgs.userId);
  //       expect(relations.delete).toHaveBeenCalledTimes(1);
  //     });
  //     it('should fail if relation not found', async () => {
  //       relations.findOne.mockResolvedValue(null);
  //       const result = await service.deleteRelation(authUser, deleteRelationArgs);
  //       expect(result).toEqual({ ok: false, error: 'Relation not found' });
  //       expect(relations.findOne).toHaveBeenCalledTimes(1);
  //       expect(relations.findOne).toHaveBeenCalledWith(
  //         deleteRelationArgs.relationId,
  //       );
  //     });
  //     it('should fail if user does not own relation', async () => {
  //       const FAIL_USER_ID = 2;
  //       relations.findOne.mockResolvedValue({ id: 1, userId: FAIL_USER_ID });
  //       const result = await service.deleteRelation(authUser, deleteRelationArgs);
  //       expect(result).toEqual({
  //         ok: false,
  //         error: "cannot delete somebodyelse's relation",
  //       });
  //     });
  //     it('should fail on exception', async () => {
  //       relations.findOne.mockRejectedValue(new Error());
  //       const result = await service.deleteRelation(authUser, deleteRelationArgs);
  //       expect(result).toEqual({ ok: false, error: 'Could not delete' });
  //     });
  //  });
});
