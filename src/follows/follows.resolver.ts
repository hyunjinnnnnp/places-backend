import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/users/entities/user.entity';
import { CreateFollowInput, CreateFollowOutput } from './dtos/createFollow.dto';
import {
  GetUserFollowersInput,
  GetUserFollowersOutput,
} from './dtos/getUserFollowers.dto';
import { Follow } from './entities/follow.entity';
import { FollowsService } from './follows.service';

@Resolver((of) => Follow)
export class FollowsResolver {
  constructor(private readonly followsService: FollowsService) {}

  @UseGuards(AuthGuard)
  @Mutation((returns) => CreateFollowOutput)
  createFollow(
    @AuthUser() authUser: User,
    @Args('input') createFollowInput: CreateFollowInput,
  ): Promise<CreateFollowOutput> {
    return this.followsService.createFollow(authUser, createFollowInput);
  }

  @Query((returns) => GetUserFollowersOutput)
  getUserFollowers(
    @Args('input') getUserFollowersInput: GetUserFollowersInput,
  ): Promise<GetUserFollowersOutput> {
    return this.followsService.getUserFollowers(getUserFollowersInput);
  }
}
