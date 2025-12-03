import axios from 'axios';
import type { CountryListResponse, PopulationResponse, PopulationQueryParams } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const countriesApi = {
  getAll: async (): Promise<CountryListResponse> => {
    const response = await api.get<CountryListResponse>('/countries');
    return response.data;
  },
};

export const populationApi = {
  get: async (params: PopulationQueryParams): Promise<PopulationResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.country_codes && params.country_codes.length > 0) {
      params.country_codes.forEach(code => {
        searchParams.append('country_codes', code);
      });
    }
    
    if (params.year_start !== undefined) {
      searchParams.append('year_start', params.year_start.toString());
    }
    
    if (params.year_end !== undefined) {
      searchParams.append('year_end', params.year_end.toString());
    }
    
    const response = await api.get<PopulationResponse>(`/population?${searchParams.toString()}`);
    return response.data;
  },
};

export default api;

