import { api } from './client';

export async function listFavorites(limit = 50) {
  const { data } = await api.get('/questions/favorites/list', {
    params: { limit },
  });
  return data;
}

export async function addFavorite(questionId: string) {
  const { data } = await api.post(`/questions/${questionId}/favorite`);
  return data;
}

export async function removeFavorite(questionId: string) {
  const { data } = await api.delete(`/questions/${questionId}/favorite`);
  return data;
}

export async function isFavorite(questionId: string) {
  const { data } = await api.get(`/questions/${questionId}/favorite`);
  return data as { isFavorite: boolean };
}
