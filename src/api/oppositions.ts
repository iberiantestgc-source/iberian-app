import { api } from './client';
import type { Opposition } from '../types';

export async function getOppositions(): Promise<Opposition[]> {
  const { data } = await api.get<Opposition[]>('/oppositions');
  return data;
}

export async function getOpposition(id: string) {
  const { data } = await api.get(`/oppositions/${id}`);
  return data;
}
