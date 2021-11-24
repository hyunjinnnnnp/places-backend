import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pagination } from 'src/common/common.pagination';
import { Follow } from 'src/follows/entities/follow.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { Suggestion } from './entities/suggestion.entity';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

const token = 'signed-token-baby';
const authUser = {
  id: 1,
  email: '',
  password: '',
  verified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  hashPassword: () => null,
  checkPassword: () => null,
  followerId: 2,
};
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
  findAndCount: jest.fn(),
  remove: jest.fn(),
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
  getTotalPages: jest.fn(() => {
    return 1;
  }),
});
const mockJwtService = () => ({
  sign: jest.fn(() => token),
  verify: jest.fn(),
});
const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});
//타입 정의
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
describe('UsersService', () => {
  let service: UsersService;
  let mailService: MailService;
  let followsRepository: MockRepository<Follow>;
  let usersRepository: MockRepository<User>;
  let pagination: Pagination;
  let verificationsRepository: MockRepository<Verification>;
  let jwtService: JwtService;
  let suggestionsRepository: MockRepository<Suggestion>;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,

        //Mock Repositories
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Follow),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Suggestion),
          useValue: mockRepository(),
        },
        {
          provide: Pagination,
          useValue: mockPagination(),
        },
        //mock services
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    pagination = module.get<Pagination>(Pagination);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
    followsRepository = module.get(getRepositoryToken(Follow));
    suggestionsRepository = module.get(getRepositoryToken(Suggestion));
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('should createAccount', () => {
    const createAccountArgs = {
      email: 'test@mail.com',
      password: 'password',
    };
    it('should fail if user exists', async () => {
      //mocking promise resolved value
      //jest intercept findOne function
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with this email already',
      });
    });
    it('should create a user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationsRepository.save.mockResolvedValue({
        code: 'code',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Could not create account',
      });
    });
  });
  describe('login', () => {
    const loginArgs = {
      email: 'fake@email.com',
      password: 'fakePassword',
    };
    it('should fail if user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: 'User not found',
      });
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
    });
    it('should fail if the password wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Please verify your password',
      });
    });
    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({
        ok: true,
        token,
      });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockResolvedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Could not login',
      });
    });
    it('should fail if the password wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Please verify your password',
      });
    });
  });
  describe('findById', () => {
    it('should find an existing user', async () => {
      const findByIdArgs = {
        id: 1,
      };
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(findByIdArgs.id);
      expect(result).toEqual({
        ok: true,
        user: findByIdArgs,
      });
    });
    it('should fail on exception', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: false,
        error: 'User not found',
      });
    });
  });
  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'old@email.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        input: {
          email: 'new@email.com',
        },
      };
      const newVerification = {
        code: 'code',
      };
      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };
      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationsRepository.create.mockReturnValue(newVerification);
      verificationsRepository.save.mockResolvedValue(newVerification);
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId,
      );
      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith(
        newVerification,
      );
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );
      expect(result).toEqual({ ok: true });
    });
    it('should change password', async () => {
      const oldUser = {
        password: 'oldPassword',
      };
      const editProfileArgs = {
        userId: 1,
        input: {
          password: 'newPassword',
        },
      };
      usersRepository.findOne.mockResolvedValue(oldUser);
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: 'fake@email.com' });
      expect(result).toEqual({ ok: false, error: 'Could not edit' });
    });
  });
  describe('verifyEmail', () => {
    const verifyEmailArgs = {
      code: 'fakeCode',
    };
    it('should fail on verification not found', async () => {
      verificationsRepository.findOne.mockResolvedValue(null);
      const result = await service.verifyEmail(verifyEmailArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Verification not found.',
      });
    });
    it('should verify email', async () => {
      const mockedVerification = {
        id: 1,
        user: { verified: false },
      };
      verificationsRepository.findOne.mockResolvedValue(mockedVerification);
      const result = await service.verifyEmail({ code: '' });
      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({ ok: true });
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });
      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith(
        mockedVerification.id,
      );
    });
    it('should fail on exception', async () => {
      verificationsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail({ code: '' });
      expect(result).toEqual({ ok: false, error: 'Could not verify email' });
    });
  });
  describe('getPrivateSuggestions', () => {
    const getPrivateSuggestionsArgs = {
      page: 1,
      followerId: authUser.followerId,
    };
    it('should get private suggestions', async () => {
      followsRepository.findAndCount.mockResolvedValue([{}, 2]);
      jest.spyOn(pagination, 'getResults').mockImplementation(async () => {
        return [[], 1];
      });
      const result = await service.getPrivateSuggestions(
        authUser,
        getPrivateSuggestionsArgs,
      );
      expect(pagination.getResults).toHaveBeenCalledTimes(1);
      expect(pagination.getResults).toHaveBeenCalledWith(
        suggestionsRepository,
        1,
        {
          where: [
            { senderId: authUser.id, receiverId: authUser.followerId },
            { senderId: authUser.followerId, receiverId: authUser.id },
          ],
        },
      );
      expect(pagination.getTotalPages).toHaveBeenCalledTimes(1);
      expect(pagination.getTotalPages).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        ok: true,
        suggestions: [],
        totalPages: 1,
        totalResults: 1,
      });
    });
    it('should fail if user and follower are not following each other', async () => {
      followsRepository.findAndCount.mockResolvedValue([{}, 1]);
      const result = await service.getPrivateSuggestions(
        authUser,
        getPrivateSuggestionsArgs,
      );
      expect(result).toEqual({
        ok: false,
        error: 'Could not found relations between users',
      });
    });
    it('should fail on exception', async () => {
      followsRepository.findAndCount.mockRejectedValue(new Error());
      const result = await service.getPrivateSuggestions(
        authUser,
        getPrivateSuggestionsArgs,
      );
      expect(result).toEqual({ ok: false, error: 'Could not load' });
    });
  });
  describe('makeSuggestion', () => {
    it('should make suggestion', async () => {
      const mockReceiver = { id: 2 };
      const makeSuggestionArgs = {
        receiverId: mockReceiver.id,
        message: '',
      };
      usersRepository.findOne.mockResolvedValue(mockReceiver);
      followsRepository.findAndCount.mockResolvedValue([[], 2]);
      suggestionsRepository.save.mockResolvedValue({});
      const result = await service.makeSuggestion(authUser, makeSuggestionArgs);
      expect(suggestionsRepository.create).toHaveBeenCalledTimes(1);
      expect(suggestionsRepository.create).toHaveBeenCalledWith({
        message: makeSuggestionArgs.message,
        sender: authUser,
        receiver: mockReceiver,
      });
      expect(suggestionsRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        ok: true,
        suggestion: {},
      });
    });
    it('should fail if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const makeSuggestionArgs = {
        receiverId: 2,
        message: '',
      };
      const result = await service.makeSuggestion(authUser, makeSuggestionArgs);
      expect(result).toEqual({
        ok: false,
        error: 'User not found',
      });
    });
    it('should make fail if user and receiver are not following each other', async () => {
      const makeSuggestionArgs = {
        receiverId: 2,
        message: '',
      };
      usersRepository.findOne.mockResolvedValue({ id: 1 });
      followsRepository.findAndCount.mockResolvedValue([{}, 1]);
      const result = await service.makeSuggestion(authUser, makeSuggestionArgs);
      expect(result).toEqual({
        ok: false,
        error: "Could not make a suggestion if you're not following each other",
      });
    });
    it('should fail on exception', async () => {
      const makeSuggestionArgs = {
        receiverId: 2,
        message: '',
      };
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.makeSuggestion(authUser, makeSuggestionArgs);
      expect(result).toEqual({ ok: false, error: 'Could not make' });
    });
  });
  describe('deleteSuggestion', () => {
    const mockedSuggestion = { id: 1, senderId: authUser.id };
    const deleteSuggestionArgs = {
      suggestionId: mockedSuggestion.id,
    };
    it('should delete Suggestion', async () => {
      suggestionsRepository.findOne.mockResolvedValue(mockedSuggestion);
      suggestionsRepository.remove.mockResolvedValue(null);
      const result = await service.deleteSuggestion(
        authUser,
        deleteSuggestionArgs,
      );
      expect(result).toEqual({ ok: true });
    });
    it('should fail if suggestion not found', async () => {
      suggestionsRepository.findOne.mockResolvedValue(null);
      const result = await service.deleteSuggestion(
        authUser,
        deleteSuggestionArgs,
      );
      expect(result).toEqual({
        ok: false,
        error: 'Could not found suggestion',
      });
    });
    it('should fail if authUser is not sender', async () => {
      const failMockedSuggestion = {
        id: 1,
        senderId: 2,
      };
      suggestionsRepository.findOne.mockResolvedValue(failMockedSuggestion);
      const result = await service.deleteSuggestion(
        authUser,
        deleteSuggestionArgs,
      );
      expect(result).toEqual({
        error: 'Could not delete suggestion belongs to you',
        ok: false,
      });
    });
    it('should fail on exception', async () => {
      suggestionsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.deleteSuggestion(
        authUser,
        deleteSuggestionArgs,
      );
      expect(result).toEqual({
        ok: false,
        error: 'Could not delete',
      });
    });
  });
});
