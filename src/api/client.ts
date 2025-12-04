import axios from 'axios';
import type { AllDataResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export async function fetchAllData(): Promise<AllDataResponse> {
  const response = await api.get<AllDataResponse>('/data');
  return response.data;
}
