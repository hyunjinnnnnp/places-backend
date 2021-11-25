import { ConsoleLogger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateFollowInput,
  CreateFollowOutput,
} from './dtos/create-follow.dto';
import {
  GetFollowersInfoInput,
  GetFollowersInfoOutput,
} from './dtos/get-followers-info.dto';
import {
  GetFollowingUsersInfoInput,
  GetFollowingUsersInfoOutput,
} from './dtos/get-followings-info.dto';
import {
  GetUserFollowsInput,
  GetUserFollowsOutput,
} from './dtos/get-user-follows.dto';
import { UnfollowInput, UnfollowOutput } from './dtos/unfollow.dto';
import { Follow } from './entities/follow.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Follow) private readonly follows: Repository<Follow>,
  ) {}

  async getUserFollows({
    userId,
  }: GetUserFollowsInput): Promise<GetUserFollowsOutput> {
    try {
      const user = await this.users.findOne(userId, {
        relations: ['followers', 'following'],
      });
      if (!user) {
        return { ok: false, error: 'User not found' };
      }
      const followers = user.followers;
      const following = user.following;
      return { ok: true, following, followers };
    } catch {
      return {
        ok: false,
        error: 'Could not found followers',
      };
    }
  }

  async getFollowersInfo({
    userId,
  }: GetFollowersInfoInput): Promise<GetFollowersInfoOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (!user) {
        return { ok: false, error: 'User not found' };
      }
      //[ Follow: { id, followingId, followerId, isChecked } ]
      //user를 팔로잉 중인 follows[]를 찾는다
      const follows = await this.follows.find({
        where: { followingId: userId },
      });
      if (!follows) {
        return { ok: false, error: 'follow not found' };
      }
      const followerIds = follows.map((follow) => {
        return follow.followerId;
      });
      const where = followerIds.map((mappedId) => {
        return { id: mappedId };
      });
      const followers = await this.users.find({
        where,
      });
      return { ok: true, followers };
    } catch {
      return { ok: false, error: 'Could not load followers info' };
    }
  }
  // User가 팔로우 하는 유저들의 인포
  // Follow -> Following User info
  async getFollowingUsersInfo({
    userId,
  }: GetFollowingUsersInfoInput): Promise<GetFollowingUsersInfoOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (!user) {
        return { ok: false, error: 'User not found' };
      }
      const follows = await this.follows.find({
        where: { followerId: userId },
      });
      if (!follows) {
        return { ok: false, error: 'follow not found' };
      }
      const followingIds = follows.map((follow) => {
        return follow.followingId;
      });
      const where = followingIds.map((mappedId) => {
        return { id: mappedId };
      });
      const following = await this.users.find({
        where,
      });
      return { ok: true, following };
    } catch {
      return { ok: false, error: 'Could not load' };
    }
  }

  async createFollow(
    authUser: User,
    { followingId }: CreateFollowInput,
  ): Promise<CreateFollowOutput> {
    try {
      const follower = await this.users.findOne(authUser.id);
      if (!follower) {
        return { ok: false, error: 'Follower not found' };
      }
      const following = await this.users.findOne(followingId);
      if (!following) {
        return { ok: false, error: 'Following user not found' };
      }
      const isFollowExists = await this.follows.findOne({
        followerId: authUser.id,
        followingId,
      });
      if (isFollowExists) {
        return {
          ok: false,
          error: 'already following',
        };
      }
      const follow = await this.follows.save(
        this.follows.create({ follower, following }),
      );
      // follower: User
      // follower.following: Follow[];
      follower.following.push(follow);
      following.followers.push(follow);
      const a = await this.users.save(follower);
      const b = await this.users.save(following);
      //TO DO : send message to following user.
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not create' };
    }
  }

  async unFollow(
    { id: followerId }: User,
    { followingId }: UnfollowInput,
  ): Promise<UnfollowOutput> {
    try {
      const follow = await this.follows.findOne({ followingId, followerId });
      if (!follow) {
        return { ok: false, error: 'Follow not found' };
      }
      await this.follows.remove(follow);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not unfollowed' };
    }
  }

  // async acceptFollow(
  //   user: User,
  //   { id: followId }: AcceptFollowInput,
  // ): Promise<AcceptFollowOutput> {
  //   try {
  //     const follow = await this.follows.findOne(followId);
  //     if (!follow) {
  //       return { ok: false, error: 'Relation not found' };
  //     }
  //     if (follow.followingId !== user.id) {
  //       return { ok: false, error: 'Could not accept somebody elses follow' };
  //     }
  //     follow.isChecked = true;
  //     await this.follows.save(follow);
  //     return { ok: true };
  //   } catch {
  //     return { ok: false, error: 'Could not Accept' };
  //   }
  // }
}
