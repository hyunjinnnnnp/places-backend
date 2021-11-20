import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateFollowInput, CreateFollowOutput } from './dtos/createFollow.dto';
import {
  GetUserFollowersInput,
  GetUserFollowersOutput,
} from './dtos/getUserFollowers.dto';
import { Follow } from './entities/follow.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Follow) private readonly follows: Repository<Follow>,
  ) {}

  async createFollow(
    authUser: User,
    { followerId, followingId }: CreateFollowInput,
  ): Promise<CreateFollowOutput> {
    try {
      const follower = await this.users.findOne(followerId);
      if (!follower) {
        return { ok: false, error: 'follower id not found' };
      }
      if (authUser.id !== followerId) {
        return { ok: false, error: 'Could not create. verify user id' };
      }
      const following = await this.users.findOne(followingId);
      if (!following) {
        return { ok: false, error: 'following id not found' };
      }
      const follow = await this.follows.findOneOrFail({
        followerId: follower.id,
        followingId: following.id,
      });
      //   if (!follow) {
      //     const newFollow = await this.follows.save(
      //       this.follows.create({
      //         followerId: followerId,
      //         followingId: followingId,
      //       }),
      //     );
      //     console.log(newFollow);
      //      }
      //DOESNT WORK
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not create' };
    }
  }

  async getUserFollowers({
    userId,
  }: GetUserFollowersInput): Promise<GetUserFollowersOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (!user) {
        return { ok: false, error: 'User not found' };
      }
      const followers = user.followers;
      return { ok: true, followers: null };
    } catch {
      return {
        ok: false,
        error: 'Could not found followers',
      };
    }
  }
}
