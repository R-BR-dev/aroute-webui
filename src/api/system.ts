import { useQuery } from '@tanstack/vue-query'

import { api, unwrap } from './client'

/**
 * `GET /api/v1/system/info`: versions and basic facts about the router.
 *
 * Every component that calls this shares one cached request (same `queryKey`).
 * With `refetchInterval` the data is re-read on that period, in milliseconds.
 */
export function useSystemInfo(options: { refetchInterval?: number } = {}) {
  return useQuery({
    queryKey: ['system', 'info'],
    queryFn: ({ signal }) => unwrap(api.GET('/api/v1/system/info', { signal })),
    refetchInterval: options.refetchInterval,
  })
}
