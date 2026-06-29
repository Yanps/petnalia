const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorEnvelope {
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

interface FetchOptions {
  readonly method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  readonly body?: unknown;
  readonly headers?: Record<string, string>;
  readonly cache?: RequestCache;
  readonly next?: NextFetchRequestConfig;
}

export async function apiFetch<TResponse>(
  path: string,
  options: FetchOptions = {},
): Promise<TResponse> {
  const { method = 'GET', body, headers = {}, cache, next } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
    ...(cache !== undefined && { cache }),
    ...(next !== undefined && { next }),
  });

  if (!response.ok) {
    const envelope = await response.json().catch(() => null) as ErrorEnvelope | null;
    throw new ApiError(
      response.status,
      envelope?.error.code ?? 'UNKNOWN_ERROR',
      envelope?.error.message ?? `HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<TResponse>;
}

export const api = {
  get: <T>(path: string, opts?: Omit<FetchOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body: unknown, opts?: Omit<FetchOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body: unknown, opts?: Omit<FetchOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T>(path: string, body: unknown, opts?: Omit<FetchOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: Omit<FetchOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...opts, method: 'DELETE' }),
};
