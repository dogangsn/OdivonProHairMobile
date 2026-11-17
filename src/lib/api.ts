import { auth } from './firebase';
import { config } from '../config';

/** A failed MainApi call, with the server's Turkish message when it sent one. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  query?: Query;
  body?: unknown;
  /** Public endpoints: send no Authorization header. */
  anonymous?: boolean;
}

function buildUrl(path: string, query?: Query): string {
  const url = `${config.apiBaseUrl}${path}`;
  if (!query) return url;
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return params.length ? `${url}?${params.join('&')}` : url;
}

async function send(method: string, path: string, options: RequestOptions, forceRefresh: boolean): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (!options.anonymous && auth.currentUser) {
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken(forceRefresh)}`;
  }
  return fetch(buildUrl(path, options.query), {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

/**
 * Calls MainApi and returns the unwrapped `data` of its `{ success, data }` envelope.
 * A 401 is retried once with a fresh ID token.
 */
export async function api<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await send(method, path, options, false);
    if (response.status === 401 && !options.anonymous && auth.currentUser) {
      response = await send(method, path, options, true);
    }
  } catch {
    throw new ApiError('Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin.', 0, 'NETWORK');
  }

  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  const envelope = body as { success?: boolean; data?: unknown; error?: { code?: string; message?: string | string[] }; message?: string | string[] } | null;

  if (!response.ok || envelope?.success === false) {
    const raw = envelope?.error?.message ?? envelope?.message;
    const message = Array.isArray(raw) ? raw[0] : raw;
    throw new ApiError(message || 'İşlem başarısız oldu.', response.status, envelope?.error?.code);
  }
  return (envelope && 'data' in envelope ? envelope.data : body) as T;
}

/** MainApi lists answer either an array or `{ items, nextCursor }`. */
export function listItems<T>(data: T[] | { items?: T[] } | null | undefined): T[] {
  if (Array.isArray(data)) return data;
  return data?.items ?? [];
}
