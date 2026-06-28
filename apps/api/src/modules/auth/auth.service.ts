import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  // TODO: register(dto) — hash password with argon2, create User + Profile
  // TODO: login(dto) — verify password, issue access + refresh tokens
  // TODO: refresh(token) — validate hashed token, rotate, issue new pair
  // TODO: logout(userId, tokenHash) — revoke token family
  // TODO: verifyEmail(token) — mark emailVerifiedAt
}
