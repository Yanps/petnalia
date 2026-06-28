import { Injectable } from '@nestjs/common';

import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  // TODO: getProfile(userId)
  // TODO: updateProfile(userId, dto)
  // TODO: deleteAccount(userId)
}
