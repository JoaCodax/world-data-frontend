import { useQuery } from '@tanstack/react-query';
import { fetchAllData } from '../api/client';
import type { Country } from '../types';

export function useAllData() {
  return useQuery({
    queryKey: ['allData'],
    queryFn: fetchAllData,
    staleTime: Infinity, // Data doesn't change during session
  });
}

// Parse compact country array to object
export function parseCountries(data: [string, string, number | null, number | null][]): Country[] {
  return data.map(([code, name, latestPopulation, rank]) => ({
    code,
    name,
    latestPopulation,
    rank,
  }));
}
