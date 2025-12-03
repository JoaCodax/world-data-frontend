export interface Country {
  id: number;
  code: string;
  name: string;
  latest_population: number | null;
  rank: number | null;
}

export interface CountryListResponse {
  countries: Country[];
}

export interface PopulationDataPoint {
  year: number;
  population: number;
}

export interface CountryPopulationSeries {
  code: string;
  name: string;
  data: PopulationDataPoint[];
}

export interface PopulationResponse {
  series: CountryPopulationSeries[];
  year_range: [number, number];
}

export interface PopulationQueryParams {
  country_codes?: string[];
  year_start?: number;
  year_end?: number;
}

