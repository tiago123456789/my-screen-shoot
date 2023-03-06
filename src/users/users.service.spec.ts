import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const repository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  const encrypterAdapter = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const jwtAdapter = {
    generate: jest.fn(),
    verify: jest.fn(),
  };

  const fakeToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  const fakeUser = new User();
  fakeUser.setId('21a4eed0-1139-4418-8c4a-561540ed0e78');
  fakeUser.setName('Teste');
  fakeUser.setEmail('teste@gmail.com');
  fakeUser.setPassword('teste');

  const fakeParams = {
    email: 'test@gmail.com',
    password: 'teste',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    service = new UsersService(repository, encrypterAdapter, jwtAdapter);
  });

  it('Should be create user with success', async () => {
    const usersDto = {
      name: 'Teste',
      email: 'teste@gmail.com',
      password: '123456789',
    };

    encrypterAdapter.hash.mockReturnValue('afdf54d78e7r5e4dadji5647');
    repository.create.mockResolvedValue(fakeUser);

    const userCreated = await service.create(usersDto);
    expect(userCreated.getName()).toBe(usersDto.name);
    expect(userCreated.getEmail()).toBe(usersDto.email);
    expect(userCreated.getPassword()).toBe('');
  });

  it('Should be return user by id with success', async () => {
    const fakeId = 'b251bd64-a23e-4e4e-8a29-2b6236940fa5';
    fakeUser.setId(fakeId);
    repository.findById.mockResolvedValue(fakeUser);

    const userReturned = await service.findUserById(fakeId);
    expect(userReturned.getName()).toBe(fakeUser.getName());
    expect(userReturned.getEmail()).toBe(fakeUser.getEmail());
    expect(userReturned.getId()).toBe(fakeUser.getId());
  });

  it('Should be throw exception when try authenticate, because email informed is invalid', async () => {
    try {
      repository.findByEmail.mockReturnValue(null);
      await service.authenticate(fakeParams);
    } catch (error) {
      expect(error.message).toBe('Credentials invalid!');
    }
  });

  it('Should be throw exception when try authenticate, because password informed is invalid', async () => {
    try {
      repository.findByEmail.mockReturnValue(fakeUser);
      encrypterAdapter.compare.mockReturnValue(false);

      await service.authenticate(fakeParams);
    } catch (error) {
      expect(error.message).toBe('Credentials invalid!');
    }
  });

  it('Should be authenticate the user and generate accessToken', async () => {
    repository.findByEmail.mockReturnValue(fakeUser);
    encrypterAdapter.compare.mockReturnValue(true);
    jwtAdapter.generate.mockReturnValue(fakeToken);

    const accessToken = await service.authenticate(fakeParams);
    expect(accessToken).toBe(fakeToken);
    expect(jwtAdapter.generate).toBeCalledTimes(1);
  });

  it('Should be throw exception when check if token is valid, but token is empty', async () => {
    try {
      await service.hasAuthenticated('');
    } catch (error) {
      expect(error.message).toBe('You need informed accessToken');
    }
  });

  it('Should be throw exception when check if token is valid, but token is invalid', async () => {
    try {
      jwtAdapter.verify.mockResolvedValue(false);
      await service.hasAuthenticated(fakeToken);
    } catch (error) {
      expect(error.message).toBe('You accessToken is invalid');
    }
  });

  it('Should be check if token is valid and return true because token is valid', async () => {
    jwtAdapter.verify.mockResolvedValue(true);
    const result = await service.hasAuthenticated(fakeToken);
    expect(result).toBe(true);
  });
});
