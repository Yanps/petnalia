import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';

import { UuidParamPipe } from './uuid-param.pipe';

const pipe = new UuidParamPipe();
const metadata = { type: 'param', data: 'id' } as const;

describe('UuidParamPipe', () => {
  it('devolve o valor quando é um UUID', () => {
    const id = '0b6c8c1e-2f4a-4d7e-9c1a-3e5f7a9b1c2d';
    expect(pipe.transform(id, metadata)).toBe(id);
  });

  it('lança ZodError apontando o nome do parâmetro quando não é UUID', () => {
    try {
      pipe.transform('undefined', metadata);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      expect((error as ZodError).issues[0]?.path).toEqual(['id']);
    }
  });
});
