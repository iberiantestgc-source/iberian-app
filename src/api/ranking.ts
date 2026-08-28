import { api } from './client';

export async function getLeaderboard(limit = 50) {
  const { data } = await api.get('/ranking/leaderboard', {
    params: { limit },
  });
  return data;
}

export async function getMyRank() {
  const { data } = await api.get('/ranking/me');
  return data;
}