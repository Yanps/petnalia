import { Controller } from '@nestjs/common';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // TODO: GET /users/me
  // TODO: PATCH /users/me
  // TODO: DELETE /users/me
}
