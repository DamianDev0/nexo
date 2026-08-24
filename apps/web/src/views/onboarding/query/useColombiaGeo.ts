'use client'

import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '@/shared/query/query-keys'

import type { FeatureCollection, Geometry } from 'geojson'

const GEOJSON_URL = '/colombia-departments.geojson'

async function fetchColombiaGeo(): Promise<FeatureCollection<Geometry>> {
  const response = await fetch(GEOJSON_URL)
  if (!response.ok) throw new Error(`GeoJSON fetch failed: ${response.status}`)
  return response.json() as Promise<FeatureCollection<Geometry>>
}

export function useColombiaGeo(): {
  geo: FeatureCollection<Geometry> | null
  failed: boolean
} {
  const { data, isError } = useQuery({
    queryKey: QUERY_KEYS.geo.colombiaMap,
    queryFn: fetchColombiaGeo,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })

  return { geo: data ?? null, failed: isError }
}
