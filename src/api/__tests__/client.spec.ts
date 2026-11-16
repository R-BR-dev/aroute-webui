import { describe, expect, it } from 'vitest'

import { ApiError, unwrap } from '../client'

/** What an `api.GET(…)` call resolves to, for a response with this status and body. */
function result(status: number, body: unknown) {
  const response = new Response(null, { status })
  return Promise.resolve(response.ok ? { data: body, response } : { error: body, response })
}

describe('unwrap', () => {
  it('returns the body of a successful response', async () => {
    await expect(unwrap(result(200, { version: '0.0.1' }))).resolves.toEqual({ version: '0.0.1' })
  })

  it("throws the Core's error code and message", async () => {
    const body = { error: { code: 'internal', message: 'Internal error' } }

    const error = await unwrap(result(500, body)).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 500, code: 'internal', message: 'Internal error' })
  })

  it('throws a generic error when the body is not from the Core', async () => {
    const error = await unwrap(result(502, '<html>Bad Gateway</html>')).catch((e: unknown) => e)

    expect(error).toMatchObject({ status: 502, code: 'http_error' })
  })
})
