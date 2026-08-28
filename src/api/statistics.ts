import { api } from './client';
import type { UserStats } from '../types';

export async function getMyStats(): Promise<UserStats> {
  const { data } = await api.get<UserStats>('/statistics/me');
  return data;
}

export async function getTopicStats(oppositionId?: string) {
  const { data } = await api.get('/statistics/me/topics', {
    params: { oppositionId },
  });
  return data;
}
