import { Platform } from 'react-native';
import { api } from './client';

/**
 * Sube avatar a PATCH /users/me/avatar
 * Campo multipart: "file" (como el backend)
 */
export async function uploadAvatar(
  uri: string,
  mimeType = 'image/jpeg',
): Promise<{ avatarUrl?: string | null; [key: string]: unknown }> {
  const formData = new FormData();
  const ext =
    mimeType === 'image/png'
      ? 'png'
      : mimeType === 'image/webp'
        ? 'webp'
        : 'jpg';
  const filename = `avatar_${Date.now()}.${ext}`;

  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    const blob = await res.blob();
    const type = blob.type || mimeType;
    formData.append(
      'file',
      new File([blob], filename, { type }),
    );
  } else {
    formData.append('file', {
      uri,
      name: filename,
      type: mimeType,
    } as any);
  }

  const { data } = await api.patch('/users/me/avatar', formData, {
    headers: {
      // Dejar que axios ponga el boundary; no forzar a mano en RN a veces ayuda:
      Accept: 'application/json',
    },
    transformRequest: [
      (body, headers) => {
        if (body instanceof FormData && headers) {
          delete (headers as any)['Content-Type'];
        }
        return body;
      },
    ],
  });

  return data;
}

export async function getMyProfile() {
  const { data } = await api.get('/users/me');
  return data;
}