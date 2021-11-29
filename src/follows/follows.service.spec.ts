import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as Pubsub from 'graphql-subscriptions';
import { PUB_SUB } from 'src/common/common.constants';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { FollowsService } from './follows.service';

jest.mock('graphql-subscriptions');

const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
  map: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('FollowService', () => {
  let service: FollowsService;
  let users: MockRepository<User>;
  let follows: MockRepository<Follow>;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FollowsService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: PUB_SUB,
          useValue: PUB_SUB,
        },
        {
          provide: getRepositoryToken(Follow),
          useValue: mockRepository(),
        },
      ],
    }).compile();
    service = module.get<FollowsService>(FollowsService);
    follows = module.get(getRepositoryToken(Follow));
    users = module.get(getRepositoryToken(User));
  });
  it('should defined', () => {
    expect(service).toBeDefined();
    expect(users).toBeDefined();
    expect(follows).toBeDefined();
  });
  describe('getUserFollows', () => {
    it('should get users follows', async () => {
      const user = { id: 1, followers: [], following: [] };
      users.findOne.mockResolvedValue(user);
      const result = await service.getUserFollows({ userId: user.id });
      expect(result).toEqual({
        ok: true,
        following: user.following,
        followers: user.followers,
      });
      expect(users.findOne).toHaveBeenCalledTimes(1);
      expect(users.findOne).toHaveBeenCalledWith(user.id, {
        relations: ['followers', 'following'],
      });
    });
    it('should fail if user does not exist', async () => {
      users.findOne.mockResolvedValue(null);
      const result = await service.getUserFollows({ userId: 1 });
      expect(result).toEqual({ ok: false, error: 'User not found' });
    });
    it('should fail on exception', async () => {
      users.findOne.mockRejectedValue(new Error());
      const result = await service.getUserFollows({ userId: 1 });
      expect(result).toEqual({
        ok: false,
        error: 'Could not found followers',
      });
    });
  });
  describe('getFollowersInfo', () => {
    const authUser = {
      id: 1,
      name: '',
      email: '',
      password: '',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      hashPassword: () => null,
      checkPassword: () => null,
      following: [],
      followers: [],
    };
    const getFollowersInfoArgs = {
      id: authUser.id,
    };
    it('should get followers info', async () => {
      const mockFollows = [
        { followerId: 1, followingId: authUser.id },
        { followerId: 2, followingId: authUser.id },
        { followerId: 3, followingId: authUser.id },
      ];
      const mockFollowers = [{ id: 1 }, { id: 2 }, { id: 3 }];
      users.findOne.mockResolvedValueOnce(authUser);
      follows.find.mockResolvedValue(mockFollows);
      users.find.mockResolvedValueOnce(mockFollowers);
      const result = await service.getFollowersInfo({
        userId: getFollowersInfoArgs.id,
      });
      expect(result).toEqual({ ok: true, followers: mockFollowers });
      expect(users.findOne).toHaveBeenCalledTimes(1);
      expect(users.findOne).toHaveBeenCalledWith(getFollowersInfoArgs.id);
      expect(follows.find).toHaveBeenCalledTimes(1);
      expect(follows.find).toHaveBeenCalledWith({
        where: { followingId: getFollowersInfoArgs.id },
      });
      expect(users.find).toHaveBeenCalledTimes(1);
      expect(users.find).toHaveBeenCalledWith({ where: mockFollowers });
    });
    it('should fail if user not found', async () => {
      users.findOne.mockResolvedValue(null);
      const result = await service.getFollowersInfo({ userId: 1 });
      follows.find.mockResolvedValue(null);
      expect(result).toEqual({ ok: false, error: 'User not found' });
    });
    it('should fail if follow not found', async () => {
      users.findOne.mockResolvedValue({ id: 1 });
      follows.find.mockResolvedValue(null);
      const result = await service.getFollowersInfo({ userId: 1 });
      expect(result).toEqual({ ok: false, error: 'follow not found' });
    });
    it('should fail on exception', async () => {
      users.findOne.mockRejectedValue(new Error());
      const result = await service.getFollowersInfo({
        userId: getFollowersInfoArgs.id,
      });
      expect(result).toEqual({
        ok: false,
        error: 'Could not load followers info',
      });
    });
  });
  describe('getFollowingUsersInfo', () => {
    const mockedFollows = [
      { id: 1, followingId: 1 },
      { id: 2, followingId: 1 },
      { id: 3, followingId: 1 },
    ];
    const mockedFollowing = [{ id: 1 }, { id: 2 }, { id: 3 }];
    it('should get following users info', async () => {
      users.findOne.mockResolvedValueOnce({ id: 1 });
      follows.find.mockResolvedValue(mockedFollows);
      users.find.mockResolvedValueOnce(mockedFollowing);
      const result = await service.getFollowingUsersInfo({ userId: 1 });
      expect(result).toEqual({ ok: true, following: mockedFollowing });
    });
    it('should fail if user not found', async () => {
      users.findOne.mockResolvedValue(null);
      const result = await service.getFollowingUsersInfo({ userId: 1 });
      expect(result).toEqual({ ok: false, error: 'User not found' });
    });
    it('should fail if follow not found', async () => {
      users.findOne.mockResolvedValue({});
      follows.find.mockResolvedValue(null);
      const result = await service.getFollowingUsersInfo({ userId: 1 });
      expect(result).toEqual({ ok: false, error: 'follow not found' });
    });
    it('should fail on exception', async () => {
      users.findOne.mockRejectedValue(new Error());
      const result = await service.getFollowingUsersInfo({ userId: 1 });
      expect(result).toEqual({ ok: false, error: 'Could not load' });
    });
  });
  describe('createFollow', () => {
    const authUser = {
      id: 1,
      name: '',
      email: '',
      password: '',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      hashPassword: () => null,
      checkPassword: () => null,
      following: [],
      followers: [],
    };
    const createFollowArgs = {
      followingId: 2,
    };
    const mockedFollowing = {
      id: createFollowArgs.followingId,
      email: '',
      password: '',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      hashPassword: () => null,
      checkPassword: () => null,
      following: [],
      followers: [],
    };
    const mockedFollow = {
      follower: authUser,
      following: mockedFollowing,
    };
    it('should create follow', async () => {
      users.findOne
        .mockReset()
        // .mockResolvedValue(null)
        .mockResolvedValueOnce(authUser)
        .mockResolvedValueOnce(mockedFollowing);
      follows.findOne.mockResolvedValue(null);
      follows.create.mockReturnValue(mockedFollow);
      follows.save.mockResolvedValue(mockedFollow);
      users.save
        .mockResolvedValue(null)
        .mockResolvedValueOnce({
          ...authUser,
          following: mockedFollow,
        })
        .mockResolvedValueOnce({
          ...mockedFollowing,
          followers: mockedFollow,
        });
      const result = await service.createFollow(authUser, createFollowArgs);
      expect(users.findOne).toHaveBeenCalledTimes(2);
      expect(users.findOne).toHaveBeenCalledWith(authUser.id);
      expect(users.findOne).toHaveBeenCalledWith(createFollowArgs.followingId);
      expect(follows.findOne).toHaveBeenCalledTimes(1);
      expect(follows.findOne).toHaveBeenCalledWith({
        followerId: authUser.id,
        followingId: mockedFollowing.id,
      });
      expect(follows.create).toHaveBeenCalledTimes(1);
      expect(follows.create).toHaveBeenCalledWith(mockedFollow);
      expect(follows.save).toHaveBeenCalledTimes(1);
      expect(follows.save).toHaveBeenCalledWith(mockedFollow);
      expect(users.save).toHaveBeenCalledTimes(2);
      expect(users.save).toHaveBeenCalledWith(authUser);
      expect(users.save).toHaveBeenCalledWith(mockedFollowing);
      expect(result).toEqual({ ok: true });
    });
    it('should fail if user not found', async () => {
      users.findOne.mockResolvedValue(null);
      const result = await service.createFollow(authUser, createFollowArgs);
      expect(result).toEqual({ ok: false, error: 'Follower not found' });
    });
    it('should fail if following not found', async () => {
      users.findOne
        .mockResolvedValue(null)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce(null);
      const result = await service.createFollow(authUser, createFollowArgs);
      expect(result).toEqual({ ok: false, error: 'Following user not found' });
    });
    it('should fail if follow already exists', async () => {
      users.findOne
        .mockResolvedValue(null)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});
      follows.findOne.mockResolvedValue({});
      const result = await service.createFollow(authUser, createFollowArgs);
      expect(result).toEqual({
        ok: false,
        error: 'already following',
      });
    });
    it('should fail on exception', async () => {
      users.findOne.mockRejectedValue(new Error());
      const result = await service.createFollow(authUser, createFollowArgs);
      expect(result).toEqual({ ok: false, error: 'Could not create' });
    });
  });
  describe('unFollow', () => {
    const authUser = {
      id: 1,
      name: '',
      email: '',
      password: '',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      hashPassword: () => null,
      checkPassword: () => null,
      followerId: 2,
    };
    const mockedFollowing = {
      id: 2,
    };
    it('should unfollow', async () => {
      const mockedFollow = {
        followingId: mockedFollowing.id,
        followerId: authUser.id,
      };
      follows.findOne.mockResolvedValue(mockedFollow);
      follows.remove.mockResolvedValue(true);
      const result = await service.unFollow(authUser, {
        followingId: mockedFollowing.id,
      });
      expect(result).toEqual({ ok: true });
    });
    it('should fail if follow does not exist', async () => {
      follows.findOne.mockResolvedValue(null);
      const result = await service.unFollow(authUser, {
        followingId: mockedFollowing.id,
      });
      expect(result).toEqual({ ok: false, error: 'Follow not found' });
    });
    it('should fail on exception', async () => {
      follows.findOne.mockRejectedValue(new Error());
      const result = await service.unFollow(authUser, {
        followingId: mockedFollowing.id,
      });
      expect(result).toEqual({ ok: false, error: 'Could not unfollowed' });
    });
  });
});
