// Country: [code, name, latestPop, rank]
export type CompactCountry = [string, string, number | null, number | null];

// Population data: { code: [[year, pop], ...] }
export type PopulationData = Record<string, [number, number][]>;

export interface AllDataResponse {
  countries: CompactCountry[];
  population: PopulationData;
}

// Parsed country for UI
export interface Country {
  code: string;
  name: string;
  latestPopulation: number | null;
  rank: number | null;
}
