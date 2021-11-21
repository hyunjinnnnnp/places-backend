import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  AcceptFollowInput,
  AcceptFollowOutput,
} from './dtos/accept-follow.dto';
import {
  CreateFollowInput,
  CreateFollowOutput,
} from './dtos/create-follow.dto';
import {
  GetFollowersInfoInput,
  GetFollowersInfoOutput,
} from './dtos/get-followers-info.dto';
import {
  GetUserFollowsInput,
  GetUserFollowsOutput,
} from './dtos/get-user-follows.dto';
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
      const user = await this.users.findOne(userId, {
        relations: ['followers'],
      });
      if (!user) {
        return { ok: false, error: 'User not found' };
      }
      //followings
      //[ Follow: { id, followingId, followerId, isChecked } ]
      //user를 팔로잉하는 사람을 찾는다
      const followings = await this.follows.find({
        where: { followingId: userId },
      });
      const followers = await Promise.all(
        followings.map(async (follow: Follow): Promise<User> => {
          const id = follow.followerId;
          const followers = await this.users.findOne({ id });
          return followers;
        }),
      );
      return { ok: true, followers };
    } catch {
      return { ok: false, error: 'Could not load followers info' };
    }
  }
  //3. get Following << Follow -> Following User info

  async createFollow(
    { id: followerId }: User,
    { followingId }: CreateFollowInput,
  ): Promise<CreateFollowOutput> {
    try {
      const follower = await this.users.findOne(followerId);
      if (!follower) {
        return { ok: false, error: 'Follower not found' };
      }
      const following = await this.users.findOne(followingId);
      if (!following) {
        return { ok: false, error: 'Following user not found' };
      }
      const exists = await this.follows.findOne({
        followerId,
        followingId,
      });
      if (exists) {
        return {
          ok: false,
          error: 'already following',
        };
      }
      const follow = await this.follows.save(
        this.follows.create({ follower, following }),
      );
      follower.following.push(follow);
      following.followers.push(follow);
      await this.users.save(follower);
      await this.users.save(following);
      console.log(follower.following, following.followers);
      //TO DO : send message to following user.
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not create' };
    }
  }

  async acceptFollow(
    user: User,
    { id: followId }: AcceptFollowInput,
  ): Promise<AcceptFollowOutput> {
    try {
      const follow = await this.follows.findOne(followId);
      if (!follow) {
        return { ok: false, error: 'Relation not found' };
      }
      if (follow.followingId !== user.id) {
        return { ok: false, error: 'Could not accept somebody elses follow' };
      }
      follow.isChecked = true;
      await this.follows.save(follow);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not Accept' };
    }
  }
}
