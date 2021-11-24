import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.pagination';
import { PlaceUserRelation } from 'src/place-user-relations/entities/place-user-relation.entity';
import { Repository } from 'typeorm';
import { Place } from './entities/place.entity';
import { PlacesService } from './places.service';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});
const mockPagination = () => ({
  getResults: jest.fn(() => {
    return {
      ok: true,
      places: [],
      totalPages: 1,
      totalResults: 1,
    };
  }),
});
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
describe('placesService', () => {
  let service: PlacesService;
  let pagination: Pagination;
  let placesRepository: MockRepository<Place>;
  let relationsRepository: MockRepository<PlaceUserRelation>;
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
          provide: Pagination,
          useValue: mockPagination(),
        },
      ],
    }).compile();
    service = module.get<PlacesService>(PlacesService);
    pagination = module.get<Pagination>(Pagination);
    placesRepository = module.get(getRepositoryToken(Place));
    relationsRepository = module.get(getRepositoryToken(PlaceUserRelation));
  });
  it('shoud be defined', () => {
    expect(service).toBeDefined();
  });
  // describe('getAllPlaces', () => {
  //   it('should get all places', async () => {
  //     //mock PAGINATION SERVICE <<<Failed

  //     jest.spyOn(pagination, 'getResults').mockImplementation(async () => {
  //       return [[], 1];
  //     });
  //     const result = await placesService.getAllPlaces({ page: 1 });
  //     expect(pagination.getResults).toHaveBeenCalledTimes(1);
  //     expect(pagination.getResults).toHaveBeenCalledWith(placesRepository, 1);
  //     expect(result).toEqual({
  //       ok: true,
  //       places: [],
  //       totalPages: 1,
  //       totalResults: 1,
  //     });
  //   });
  //   it('should fail on exception', async () => {
  //     jest.spyOn(pagination, 'getResults').mockImplementation(async () => {
  //       return new Error();
  //     });
  //     const result = await placesService.getAllPlaces({ page: 1 });
  //     expect(result).toEqual({
  //       ok: false,
  //       error: 'Could not load',
  //     });
  //   });
  // });
  // describe('createPlace', () => {
  //   const createPlaceArgs = {
  //     name: '',
  //     address: '',
  //   };
  //   it('should create place', async () => {
  //     const place = {
  //       id: 1,
  //       name: createPlaceArgs.name,
  //       address: createPlaceArgs.address,
  //     };
  //     placesRepository.create.mockReturnValue(place);
  //     const result = await placesService.createPlace(createPlaceArgs);
  //     expect(placesRepository.create).toHaveBeenCalledTimes(1);
  //     expect(placesRepository.create).toHaveBeenCalledWith(createPlaceArgs);
  //     expect(placesRepository.save).toHaveBeenCalledTimes(1);
  //     expect(placesRepository.save).toHaveBeenCalledWith(place);
  //     expect(result).toEqual({ ok: true, place });
  //   });
  //   it('should fail on exception', async () => {
  //     placesRepository.save.mockRejectedValue(new Error());
  //     const result = await placesService.createPlace(createPlaceArgs);
  //     expect(result).toEqual({ ok: false, error: 'Could not create' });
  //   });
  // });
  // describe('editPlace', () => {
  //   it('should edit places', async () => {
  //     const editPlaceArgs = {
  //       id: 1,
  //       coverImg: '',
  //     };
  //     const mockPlace = {
  //       id: 1,
  //     };
  //     placesRepository.findOne.mockResolvedValue({ id: 1 });
  //     placesRepository.save.mockResolvedValue(editPlaceArgs);
  //     const result = await placesService.editPlace({
  //       placeId: editPlaceArgs.id,
  //       coverImg: editPlaceArgs.coverImg,
  //     });
  //     expect(placesRepository.findOne).toHaveBeenCalledTimes(1);
  //     expect(placesRepository.findOne).toHaveBeenCalledWith(editPlaceArgs.id);
  //     expect(placesRepository.save).toHaveBeenCalledTimes(1);
  //     expect(placesRepository.save).toHaveBeenCalledWith({
  //       coverImg: '',
  //       id: 1,
  //       placeId: 1,
  //       // WHY placeId is included?
  //     });
  //     expect(result).toEqual({
  //       ok: true,
  //       place: mockPlace,
  //     });
  //   });
  //   it('should fail if place not found', async () => {
  //     placesRepository.findOne.mockResolvedValue(null);
  //     const result = await placesService.editPlace({ placeId: 1, name: '' });
  //     expect(result).toEqual({
  //       ok: false,
  //       error: 'Place not found',
  //     });
  //     expect(placesRepository.findOne).toHaveBeenCalledWith(1);
  //     expect(placesRepository.findOne).toHaveBeenCalledTimes(1);
  //   });
  //   it('should fail on exception', async () => {
  //     placesRepository.findOne.mockRejectedValue(new Error());
  //     const result = await placesService.editPlace({ placeId: 1 });
  //     expect(placesRepository.findOne).toHaveBeenCalledTimes(1);
  //     expect(placesRepository.findOne).toHaveBeenCalledWith(1);
  //     expect(result).toEqual({ ok: false, error: 'Could not Edit' });
  //   });
  // });
  // describe('deletePlace', () => {
  //   const place = {
  //     id: 1,
  //   };
  //   it('should delete place', async () => {
  //     placesRepository.findOne.mockResolvedValue(place);
  //     const result = await placesService.deletePlace({ placeId: place.id });
  //     expect(placesRepository.findOne).toHaveBeenCalledTimes(1);
  //     expect(placesRepository.findOne).toHaveBeenCalledWith(1);
  //     expect(result).toEqual({ ok: true });
  //   });
  //   it('should fail if place not found', async () => {
  //     placesRepository.findOne.mockResolvedValue(null);
  //     const result = await placesService.deletePlace({ placeId: place.id });
  //     expect(placesRepository.findOne).toHaveBeenCalledTimes(1);
  //     expect(placesRepository.findOne).toHaveBeenCalledWith(1);
  //     expect(result).toEqual({ ok: false, error: 'Place not found' });
  //   });
  //   it('should fail if relation exists', async () => {
  //     placesRepository.findOne.mockResolvedValue({ id: 1 });
  //     relationsRepository.findOne.mockResolvedValue({ id: 1 });
  //     const result = await placesService.deletePlace({ placeId: place.id });
  //     expect(placesRepository.findOne).toHaveBeenCalledTimes(1);
  //     expect(placesRepository.findOne).toHaveBeenCalledWith(1);
  //     expect(relationsRepository.findOne).toHaveBeenCalledTimes(1);
  //     expect(relationsRepository.findOne).toHaveBeenCalledWith({ placeId: 1 });
  //     expect(result).toEqual({
  //       ok: false,
  //       error: 'Relation exists. Could not delete',
  //     });
  //   });
  //   it('should fail on exception', async () => {
  //     placesRepository.findOne.mockRejectedValue(new Error());
  //     const result = await placesService.deletePlace({ placeId: 1 });
  //     expect(result).toEqual({ ok: false, error: 'Could not delete' });
  //   });
  //});
});
