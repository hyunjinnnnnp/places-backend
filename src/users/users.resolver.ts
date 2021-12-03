import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { NEW_PENDING_SUGGESTION, PUB_SUB } from 'src/common/common.constants';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import {
  DeleteSuggestionInput,
  DeleteSuggestionOutput,
} from './dto/delete-suggestion.dto';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';
import {
  GetPrivateSuggestionsInput,
  GetPrivateSuggestionsOutput,
} from './dto/get-private-suggestions.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import {
  CreateSuggestionInput,
  CreateSuggestionOutput,
} from './dto/create-suggestion.dto';
import { UserProfileInput, UserProfileOutput } from './dto/user-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dto/verify-email.dto';
import { Suggestion } from './entities/suggestion.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { MyProfileOutput } from './dto/my-profile.dto';
import { LogoutInput, LogoutOutput } from './dto/logout.dto';

@Resolver((of) => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @UseGuards(AuthGuard)
  @Query((returns) => MyProfileOutput)
  myProfile(@AuthUser() authUser: User): Promise<MyProfileOutput> {
    return this.usersService.myProfile(authUser);
  }

  @Mutation((returns) => CreateAccountOutput)
  createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation((returns) => LoginOutput)
  login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  // @Mutation((returns) => LogoutOutput)
  // logout(@Args('input') logoutInput: LogoutInput): Promise<LogoutOutput> {
  //   return this.usersService.logout(logoutInput);
  // }

  // @UseGuards(AuthGuard)
  // @Query((returns) => UserProfileOutput)
  // userProfile(
  //   @Args() userProfileInput: UserProfileInput,
  // ): Promise<UserProfileOutput> {
  //   return this.usersService.findById(userProfileInput.userId);
  // }

  @UseGuards(AuthGuard)
  @Mutation((returns) => EditProfileOutput)
  editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput);
  }

  @Mutation((returns) => VerifyEmailOutput)
  verifyEmail(
    @Args('input') verifyEmailInput: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(verifyEmailInput);
  }

  //------------------------- suggestions ---------------------------//

  @UseGuards(AuthGuard)
  @Query((returns) => GetPrivateSuggestionsOutput)
  getPrivateSuggestions(
    @AuthUser() authUser: User,
    @Args('input') getPrivateSuggestionsInput: GetPrivateSuggestionsInput,
  ): Promise<GetPrivateSuggestionsOutput> {
    return this.usersService.getPrivateSuggestions(
      authUser,
      getPrivateSuggestionsInput,
    );
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => CreateSuggestionOutput)
  createSuggestion(
    @AuthUser() authUser: User,
    @Args('input') createSuggestionInput: CreateSuggestionInput,
  ): Promise<CreateSuggestionOutput> {
    return this.usersService.createSuggestion(authUser, createSuggestionInput);
  }

  @UseGuards(AuthGuard)
  @Subscription((returns) => Suggestion, {
    filter: ({ pendingSuggestion: { receiverId } }, _, { user }) => {
      return receiverId === user.id;
    },
    resolve: ({ pendingSuggestion: { suggestion } }) => {
      return suggestion;
    },
  })
  pendingSuggestion() {
    return this.pubSub.asyncIterator(NEW_PENDING_SUGGESTION);
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => DeleteSuggestionOutput)
  deleteSuggestion(
    @AuthUser() user: User,
    @Args('input') deleteSuggestionInput: DeleteSuggestionInput,
  ): Promise<DeleteSuggestionOutput> {
    return this.usersService.deleteSuggestion(user, deleteSuggestionInput);
  }
}
