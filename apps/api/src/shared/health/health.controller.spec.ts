import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import { HealthController } from './health.controller';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('HealthController', () => {
  it('responde ok sem consultar nada (liveness)', () => {
    expect(new HealthController().check()).toEqual({ status: 'ok' });
  });

  it('é público, para o balanceador consultar sem token', () => {
    const isPublic = new Reflector().get<boolean>(IS_PUBLIC_KEY, HealthController.prototype.check);
    expect(isPublic).toBe(true);
  });
});
