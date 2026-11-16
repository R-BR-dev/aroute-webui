import createClient from 'openapi-fetch'

import type { components, paths } from './schema'

/** Request and response bodies of the Core API, by their name in the API description. */
export type Schemas = components['schemas']

/**
 * Typed `fetch` for the Core API: paths, parameters and bodies are checked
 * against `schema.d.ts`, which is generated from the Core's `openapi.json`.
 *
 * The Core serves this app, so the API is on the page's own origin.
 */
export const api = createClient<paths>({
  baseUrl: window.location.origin,
  // Looked up on every call, not once here, so tests can replace the global `fetch`.
  fetch: (request) => globalThis.fetch(request),
})

/** A request the Core answered with an error, or did not answer properly at all. */
export class ApiError extends Error {
  constructor(
    /** HTTP status code. */
    readonly status: number,
    /** The Core's stable error identifier, or `http_error` when the body is not the Core's. */
    readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function isErrorBody(body: unknown): body is Schemas['ErrorBody'] {
  const detail = (body as Partial<Schemas['ErrorBody']> | null)?.error
  return typeof detail?.code === 'string' && typeof detail.message === 'string'
}

/**
 * Turns the `{ data, error, response }` of an `api` call into its data, or throws.
 *
 * openapi-fetch reports HTTP errors as a value. Server-state code (TanStack
 * Query) expects a rejected promise, so every query function goes through here:
 *
 *     queryFn: () => unwrap(api.GET('/api/v1/system/info'))
 *
 * The error body is checked rather than trusted: when the Core is down, a proxy
 * in front of it may answer with plain text or HTML.
 */
export async function unwrap<T>(
  request: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await request
  if (response.ok) return data as T

  if (isErrorBody(error)) {
    throw new ApiError(response.status, error.error.code, error.error.message)
  }
  throw new ApiError(response.status, 'http_error', `HTTP ${response.status}`)
}
