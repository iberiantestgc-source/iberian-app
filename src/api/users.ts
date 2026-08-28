import { api } from './client';

export async function uploadAvatar(uri: string, mimeType = 'image/jpeg') {
  const formData = new FormData();

  formData.append('avatar', {
    uri,
    name: `avatar_${Date.now()}.jpg`,
    type: mimeType,
  } as any);

  const { data } = await api.post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data; // debe devolver { avatarUrl: string }
}