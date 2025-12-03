import { useQuery } from '@tanstack/react-query';
import { countriesApi, populationApi } from '../api/client';
import type { PopulationQueryParams } from '../types';

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: countriesApi.getAll,
  });
}

export function usePopulation(params: PopulationQueryParams, enabled: boolean = true) {
  return useQuery({
    queryKey: ['population', params],
    queryFn: () => populationApi.get(params),
    enabled: enabled && (params.country_codes?.length ?? 0) > 0,
  });
}

