import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.pagination';
import { PlaceUserRelation } from 'src/place-user-relations/entities/place-user-relation.entity';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Place } from './entities/place.entity';
import { PlacesService } from './places.service';
import { CategoryRepository } from './repositories/category.repository';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
});
const mockPagination = () => ({
  getResults: jest.fn(),
  getTotalPages: jest.fn(),
});
const mockCategoryRepository = () => ({
  getOrCreate: jest.fn(),
});
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
describe('placesService', () => {
  let service: PlacesService;
  let pagination: Pagination;
  let categoryRepository: CategoryRepository;
  let placesRepository: MockRepository<Place>;
  let relationsRepository: MockRepository<PlaceUserRelation>;
  let categories: MockRepository<Category>;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PlacesService,
        {
          provide: getRepositoryToken(Place),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(PlaceUserRelation),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
        {
          provide: Pagination,
          useValue: mockPagination(),
        },
        {
          provide: CategoryRepository,
          useValue: mockCategoryRepository(),
        },
      ],
    }).compile();
    service = module.get<PlacesService>(PlacesService);
    pagination = module.get<Pagination>(Pagination);
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
    placesRepository = module.get(getRepositoryToken(Place));
    relationsRepository = module.get(getRepositoryToken(PlaceUserRelation));
    categories = module.get(getRepositoryToken(Category));
  });
  it('shoud be defined', () => {
    expect(service).toBeDefined();
  });
  describe('getAllPlacesPaginated', () => {
    it('should get all places paginated', async () => {
      jest.spyOn(pagination, 'getResults').mockImplementation(async () => {
        return [[], 1];
      });
      jest.spyOn(pagination, 'getTotalPages').mockImplementation(async () => {
        return 1;
      });
      const result = await service.getAllPlacesPaginated({ page: 1 });
      expect(pagination.getResults).toHaveBeenCalledTimes(1);
      expect(pagination.getResults).toHaveBeenCalledWith(placesRepository, 1);
      expect(result).toEqual({
        ok: true,
        places: [],
        totalPages: 1,
        totalResults: 1,
      });
      expect(pagination.getTotalPages).toHaveBeenCalledTimes(1);
      expect(pagination.getTotalPages).toHaveBeenCalledWith(1);
    });
    it('should fail on exception', async () => {
      jest.spyOn(pagination, 'getResults').mockImplementation(async () => {
        return new Error();
      });
      const result = await service.getAllPlacesPaginated({ page: 1 });
      expect(result).toEqual({
        ok: false,
        error: 'Could not load',
      });
    });
  });
  describe('getAllPlaces', () => {
    it('should get all places', async () => {
      placesRepository.find.mockResolvedValue([]);
      const result = await service.getAllPlaces();
      expect(placesRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        ok: true,
        places: [],
      });
    });
    it('should fail on exception', async () => {
      placesRepository.find.mockRejectedValue(new Error());
      const result = await service.getAllPlaces();
      expect(result).toEqual({ ok: false, error: 'Could not load' });
    });
  });
  describe('createPlace', () => {
    const createPlaceArgs = {
      name: '',
      address: '',
      categoryName: '',
      coverImg: '',
    };
    const mockedCategory = {
      id: 1,
      name: createPlaceArgs.name,
      slug: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    it('should create place', async () => {
      const place = {
        id: 1,
        name: createPlaceArgs.name,
        address: createPlaceArgs.address,
        category: mockedCategory,
      };
      placesRepository.create.mockReturnValue(place);
      jest
        .spyOn(categoryRepository, 'getOrCreate')
        .mockImplementation(async () => {
          return mockedCategory;
        });
      const result = await service.createPlace(createPlaceArgs);
      expect(placesRepository.create).toHaveBeenCalledTimes(1);
      expect(placesRepository.create).toHaveBeenCalledWith({
        name: createPlaceArgs.name,
        address: createPlaceArgs.address,
      });
      expect(placesRepository.save).toHaveBeenCalledTimes(1);
      expect(placesRepository.save).toHaveBeenCalledWith(place);
      expect(result).toEqual({ ok: true, place });
    });
    it('should fail on exception', async () => {
      placesRepository.save.mockRejectedValue(new Error());
      const result = await service.createPlace(createPlaceArgs);
      expect(result).toEqual({ ok: false, error: 'Could not create' });
    });
  });
  describe('editPlace', () => {
    it('should edit places', async () => {
      const oldPlace = {
        id: 1,
      };
      const editPlaceArgs = {
        id: oldPlace.id,
        coverImg: '',
        name: '',
        address: '',
      };
      placesRepository.findOne.mockResolvedValue(oldPlace);
      placesRepository.save.mockResolvedValue(editPlaceArgs);
      const result = await service.editPlace({
        placeId: editPlaceArgs.id,
        coverImg: editPlaceArgs.coverImg,
        name: editPlaceArgs.name,
        address: editPlaceArgs.address,
      });
      expect(placesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(placesRepository.findOne).toHaveBeenCalledWith(oldPlace.id);
      expect(placesRepository.save).toHaveBeenCalledTimes(1);
      expect(placesRepository.save).toHaveBeenCalledWith(editPlaceArgs);
      expect(result).toEqual({
        ok: true,
        place: editPlaceArgs,
      });
    });
    it('should fail if place not found', async () => {
      placesRepository.findOne.mockResolvedValue(null);
      const result = await service.editPlace({ placeId: 1, name: '' });
      expect(result).toEqual({
        ok: false,
        error: 'Place not found',
      });
    });
    it('should fail on exception', async () => {
      placesRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editPlace({ placeId: 1 });
      expect(result).toEqual({ ok: false, error: 'Could not Edit' });
    });
  });
  describe('deletePlace', () => {
    const place = {
      id: 1,
    };
    it('should delete place', async () => {
      placesRepository.findOne.mockResolvedValue(place);
      const result = await service.deletePlace({ placeId: place.id });
      expect(placesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(placesRepository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ ok: true });
    });
    it('should fail if place not found', async () => {
      placesRepository.findOne.mockResolvedValue(null);
      const result = await service.deletePlace({ placeId: place.id });
      expect(placesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(placesRepository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ ok: false, error: 'Place not found' });
    });
    it('should fail if relation exists', async () => {
      placesRepository.findOne.mockResolvedValue({ id: 1 });
      relationsRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.deletePlace({ placeId: place.id });
      expect(placesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(placesRepository.findOne).toHaveBeenCalledWith(1);
      expect(relationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(relationsRepository.findOne).toHaveBeenCalledWith({ placeId: 1 });
      expect(result).toEqual({
        ok: false,
        error: 'Relation exists. Could not delete',
      });
    });
    it('should fail on exception', async () => {
      placesRepository.findOne.mockRejectedValue(new Error());
      const result = await service.deletePlace({ placeId: 1 });
      expect(result).toEqual({ ok: false, error: 'Could not delete' });
    });
  });
});
