import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/users/entities/user.entity';
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
  GetFollowingUsersInfoInput,
  GetFollowingUsersInfoOutput,
} from './dtos/get-followings-info.dto';
import {
  GetUserFollowsInput,
  GetUserFollowsOutput,
} from './dtos/get-user-follows.dto';
import { UnfollowInput, UnfollowOutput } from './dtos/unfollow.dto';
import { Follow } from './entities/follow.entity';
import { FollowsService } from './follows.service';

@Resolver((of) => Follow)
export class FollowsResolver {
  constructor(private readonly followsService: FollowsService) {}

  @Query((returns) => GetUserFollowsOutput)
  getUserFollows(
    @Args('input') getUserFollowsInput: GetUserFollowsInput,
  ): Promise<GetUserFollowsOutput> {
    return this.followsService.getUserFollows(getUserFollowsInput);
  }

  @Query((returns) => GetFollowersInfoOutput)
  getFollowersInfo(
    @Args('input') getFollowersInfoInput: GetFollowersInfoInput,
  ): Promise<GetFollowersInfoOutput> {
    return this.followsService.getFollowersInfo(getFollowersInfoInput);
  }

  @Query((retusn) => GetFollowingUsersInfoOutput)
  getFollowingUsersInfo(
    @Args('input') getFollowingUsersInfoInput: GetFollowingUsersInfoInput,
  ): Promise<GetFollowingUsersInfoOutput> {
    return this.followsService.getFollowingUsersInfo(
      getFollowingUsersInfoInput,
    );
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => CreateFollowOutput)
  createFollow(
    @AuthUser() authUser: User,
    @Args('input') createFollowInput: CreateFollowInput,
  ): Promise<CreateFollowOutput> {
    return this.followsService.createFollow(authUser, createFollowInput);
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => UnfollowOutput)
  unFollow(
    @AuthUser() authUser: User,
    @Args('input') unFollowInput: UnfollowInput,
  ): Promise<UnfollowOutput> {
    return this.followsService.unFollow(authUser, unFollowInput);
  }

  // @UseGuards(AuthGuard)
  // @Mutation((retuns) => AcceptFollowOutput)
  // acceptFollow(
  //   @AuthUser() authUser: User,
  //   @Args('input') acceptFollowInput: AcceptFollowInput,
  // ): Promise<AcceptFollowOutput> {
  //   return this.followsService.acceptFollow(authUser, acceptFollowInput);
  // }
}
