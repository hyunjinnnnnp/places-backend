import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.pagination';
import { Place } from 'src/places/entities/place.entity';
import { User } from 'src/users/entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { PlaceUserRelation } from './entities/place-user-relation.entity';
import { PlaceUserRelationsService } from './place-user-relations.service';

const authUser = {
  id: 1,
  email: '',
  password: '',
  verified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  hashPassword: () => null,
  checkPassword: () => null,
};
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
  let placeUserRelations: MockRepository<PlaceUserRelation>;
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
    placeUserRelations = module.get(getRepositoryToken(PlaceUserRelation));
    users = module.get(getRepositoryToken(User));
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('getMyPlaceRelations', () => {
    it('should get my place relations', async () => {
      jest.spyOn(pagination, 'getResults').mockImplementation(async () => {
        return [[], 1];
      });
      jest.spyOn(pagination, 'getTotalPages').mockImplementation(async () => {
        return 1;
      });
      const result = await service.getMyPlaceRelations(authUser, { page: 1 });
      expect(result).toEqual({
        ok: true,
        relations: [],
        totalResults: 1,
        totalPages: 1,
      });
    });
    it('should fail on exception', async () => {
      jest.spyOn(pagination, 'getResults').mockRejectedValue(async () => {
        return new Error();
      });
      const result = await service.getMyPlaceRelations(authUser, { page: 1 });
      expect(result).toEqual({ ok: false, error: 'Could not load' });
    });
  });
  describe('getPlaceUserRelationDetail', () => {
    const getRelationDetailArgs = {
      relationId: 1,
    };
    it('should return relation', async () => {
      const mockedRelation = { id: 1, place: { id: 1 } };
      placeUserRelations.findOne.mockResolvedValue(mockedRelation);
      const result = await service.getPlaceUserRelationDetail(
        getRelationDetailArgs,
      );
      expect(placeUserRelations.findOne).toHaveBeenCalledTimes(1);
      expect(placeUserRelations.findOne).toHaveBeenCalledWith(
        getRelationDetailArgs.relationId,
        {
          relations: ['place'],
        },
      );
      expect(result).toEqual({ ok: true, relation: mockedRelation });
    });
    it('should fail if relation not found', async () => {
      placeUserRelations.findOne.mockResolvedValue(null);
      const result = await service.getPlaceUserRelationDetail(
        getRelationDetailArgs,
      );
      expect(result).toEqual({ ok: false, error: 'Relation not found' });
    });
    it('should fail on exception', async () => {
      placeUserRelations.findOne.mockRejectedValue(new Error());
      const result = await service.getPlaceUserRelationDetail(
        getRelationDetailArgs,
      );
      expect(result).toEqual({ ok: false, error: 'Could not load' });
    });
  });
  describe('getPlaceUserRelationsByUserId', () => {
    const getRelationArgs = { userId: 1, page: 1 };
    it('should get places by user id', async () => {
      const mockedUser = { id: 1 };
      users.findOne.mockResolvedValue(mockedUser);

      jest.spyOn(pagination, 'getResults').mockImplementation(async () => {
        return [[], getRelationArgs.page];
      });
      await service.getPlaceUserRelationsByUserId(getRelationArgs);
      expect(pagination.getResults).toHaveBeenCalledTimes(1);
      expect(pagination.getResults).toHaveBeenCalledWith(
        placeUserRelations,
        getRelationArgs.page,
        { user: mockedUser },
      );
    });
    it('should fail if user not found', async () => {
      users.findOne.mockResolvedValue(null);
      const result = await service.getPlaceUserRelationsByUserId(
        getRelationArgs,
      );
      expect(result).toEqual({ ok: false, error: "User id doesn't exist" });
    });
    it('should fail on exception', async () => {
      users.findOne.mockResolvedValue({ id: 1 });
      jest.spyOn(pagination, 'getTotalPages').mockRejectedValue(new Error());
      const result = await service.getPlaceUserRelationsByUserId(
        getRelationArgs,
      );
      expect(result).toEqual({
        ok: false,
        error: 'Could not load relations',
      });
    });
  });

  describe('searchPlaceUserRelationByName', () => {
    const searchArgs = {
      page: 1,
      query: 'searchQuery',
    };
    const findOptions = {
      relations: ['place'],
      where: {
        user: authUser,
        place: {
          name: ILike(`%${searchArgs.query}%`),
        },
      },
    };
    it('should search users relations by query', async () => {
      // users.findOne.mockResolvedValue(authUser);
      jest.spyOn(pagination, 'getResults').mockImplementation(async () => {
        return [[authUser], 1];
      });
      jest.spyOn(pagination, 'getTotalPages').mockImplementation(async () => {
        return 1;
      });
      const result = await service.searchPlaceUserRelationByName(
        authUser,
        searchArgs,
      );
      expect(pagination.getResults).toHaveBeenCalledTimes(1);
      expect(pagination.getResults).toHaveBeenCalledWith(
        placeUserRelations,
        searchArgs.page,
        findOptions,
      );
      expect(pagination.getTotalPages).toHaveBeenCalledTimes(1);
      expect(pagination.getTotalPages).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        ok: true,
        relations: [authUser],
        totalResults: 1,
        totalPages: 1,
      });
    });
    it('should fail on exception', async () => {
      users.findOne.mockResolvedValue(authUser);
      const result = await service.searchPlaceUserRelationByName(
        authUser,
        searchArgs,
      );
      jest.spyOn(pagination, 'getTotalPages').mockRejectedValue(new Error());
      expect(result).toEqual({
        ok: false,
        error: 'Could not load',
      });
    });
  });
  describe('createPlaceUserRelation', () => {
    const user = { id: 1 };
    const place = { id: 1 };
    const createRelationArgs = {
      userId: user.id,
      placeId: place.id,
    };
    it('should create relation', async () => {
      places.findOne.mockResolvedValue(place);
      placeUserRelations.findOne.mockResolvedValue(null);
      placeUserRelations.create.mockResolvedValue(createRelationArgs);
      placeUserRelations.save.mockResolvedValue(createRelationArgs);
      const result = await service.createPlaceUserRelation(
        authUser,
        createRelationArgs,
      );
      expect(places.findOne).toHaveBeenCalledTimes(1);
      expect(places.findOne).toHaveBeenCalledWith(place.id);
      expect(placeUserRelations.findOne).toHaveBeenCalledTimes(1);
      expect(placeUserRelations.findOne).toHaveBeenCalledWith({
        userId: authUser.id,
        placeId: place.id,
      });
      expect(placeUserRelations.create).toHaveBeenCalledTimes(1);
      expect(placeUserRelations.create).toHaveBeenCalledWith(
        createRelationArgs,
      );
      expect(placeUserRelations.save).toHaveBeenCalledTimes(1);
      expect(placeUserRelations.save).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ ok: true, relation: createRelationArgs });
    });
    it('should fail if place not found', async () => {
      places.findOne.mockResolvedValue(null);
      const result = await service.createPlaceUserRelation(
        authUser,
        createRelationArgs,
      );
      expect(result).toEqual({
        ok: false,
        error: 'Place id not found',
      });
    });
    it('should fail if relation exists', async () => {
      users.findOne.mockResolvedValue(user);
      places.findOne.mockResolvedValue(place);
      placeUserRelations.findOne.mockResolvedValue({ id: 1 });
      const result = await service.createPlaceUserRelation(
        authUser,
        createRelationArgs,
      );
      expect(result).toEqual({
        ok: false,
        error: 'relation already exists',
      });
    });
    it('should fail on exception', async () => {
      places.findOne.mockRejectedValue(new Error());
      const result = await service.createPlaceUserRelation(
        authUser,
        createRelationArgs,
      );
      expect(result).toEqual({ ok: false, error: 'Could not create' });
    });
  });
  describe('editPlaceUserRelation', () => {
    const oldRelation = {
      id: 1,
      userId: 1,
    };
    const editRelationArgs = {
      relationId: 1,
      userId: 1,
      input: { memo: '' },
    };
    it('should edit relation', async () => {
      placeUserRelations.findOne.mockResolvedValue(oldRelation);
      placeUserRelations.save.mockResolvedValue(editRelationArgs);
      const result = await service.editPlaceUserRelation(
        authUser,
        editRelationArgs,
      );
      expect(result).toEqual({ ok: true });
      expect(placeUserRelations.findOne).toHaveBeenCalledTimes(1);
      expect(placeUserRelations.findOne).toHaveBeenCalledWith(
        editRelationArgs.relationId,
      );
      expect(placeUserRelations.save).toHaveBeenCalledTimes(1);
      expect(placeUserRelations.save).toHaveBeenCalledWith({
        id: editRelationArgs.relationId,
        ...editRelationArgs,
      });
    });
    it('should fail if relation not found', async () => {
      placeUserRelations.findOne.mockResolvedValue(null);
      const result = await service.editPlaceUserRelation(
        authUser,
        editRelationArgs,
      );
      expect(result).toEqual({ ok: false, error: 'Relation not found' });
    });
    it('should fail if authUser is not placeUserRelations owner', async () => {
      const FAIL_USER_ID = 2;
      placeUserRelations.findOne.mockResolvedValue({
        id: 1,
        userId: FAIL_USER_ID,
      });
      const result = await service.editPlaceUserRelation(
        authUser,
        editRelationArgs,
      );
      expect(result).toEqual({
        ok: false,
        error: "Could not edit somebody else's relation",
      });
    });
    it('should fail on exception', async () => {
      placeUserRelations.findOne.mockRejectedValue(new Error());
      const result = await service.editPlaceUserRelation(
        authUser,
        editRelationArgs,
      );
      expect(result).toEqual({ ok: false, error: 'Could not edit' });
    });
  });
  describe('deletePlaceUserRelation', () => {
    const deleteRelationArgs = {
      relationId: 1,
      userId: 1,
    };
    const relation = { relationId: 1, userId: 1 };

    it('should delete relation', async () => {
      placeUserRelations.findOne.mockResolvedValue(relation);
      const result = await service.deletePlaceUserRelation(
        authUser,
        deleteRelationArgs,
      );
      expect(result).toEqual({ ok: true });
      expect(placeUserRelations.findOne).toHaveBeenCalledTimes(1);
      expect(placeUserRelations.findOne).toHaveBeenCalledWith(
        deleteRelationArgs.userId,
      );
      expect(placeUserRelations.delete).toHaveBeenCalledTimes(1);
      expect(placeUserRelations.delete).toHaveBeenCalledWith(
        deleteRelationArgs.relationId,
      );
    });
    it('should fail if relation not found', async () => {
      placeUserRelations.findOne.mockResolvedValue(null);
      const result = await service.deletePlaceUserRelation(
        authUser,
        deleteRelationArgs,
      );
      expect(result).toEqual({ ok: false, error: 'Relation not found' });
    });
    it('should fail if user does not own relation', async () => {
      const FAIL_USER_ID = 2;
      placeUserRelations.findOne.mockResolvedValue({
        id: 1,
        userId: FAIL_USER_ID,
      });
      const result = await service.deletePlaceUserRelation(
        authUser,
        deleteRelationArgs,
      );
      expect(result).toEqual({
        ok: false,
        error: "cannot delete somebodyelse's relation",
      });
    });
    it('should fail on exception', async () => {
      placeUserRelations.findOne.mockRejectedValue(new Error());
      const result = await service.deletePlaceUserRelation(
        authUser,
        deleteRelationArgs,
      );
      expect(result).toEqual({ ok: false, error: 'Could not delete' });
    });
  });
});
