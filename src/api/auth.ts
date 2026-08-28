import { api, saveTokens, clearTokens } from './client';
import type { AuthResponse, User } from '../types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post('/auth/login', { email, password });
  const data = res.data;

  const accessToken = data?.accessToken ?? data?.access_token;
  const refreshToken = data?.refreshToken ?? data?.refresh_token;
  const user = data?.user;

  if (!accessToken || !refreshToken) {
    throw new Error(
      `Login sin tokens. Respuesta: ${JSON.stringify(data).slice(0, 200)}`,
    );
  }

  await saveTokens(accessToken, refreshToken);

  return {
    user,
    accessToken,
    refreshToken,
  };
}

export async function register(
  email: string,
  password: string,
  name?: string,
): Promise<AuthResponse> {
  const res = await api.post('/auth/register', { email, password, name });
  const data = res.data;

  const accessToken = data?.accessToken ?? data?.access_token;
  const refreshToken = data?.refreshToken ?? data?.refresh_token;
  const user = data?.user;

  if (!accessToken || !refreshToken) {
    throw new Error(
      `Registro sin tokens. Respuesta: ${JSON.stringify(data).slice(0, 200)}`,
    );
  }

  await saveTokens(accessToken, refreshToken);

  return {
    user,
    accessToken,
    refreshToken,
  };
}

export async function logout() {
  try {
    const { getRefreshToken } = await import('./client');
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
  } finally {
    await clearTokens();
  }
}

export async function forgotPassword(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('Introduce tu email');
  }

  const res = await api.post('/auth/forgot-password', {
    email: normalizedEmail,
  });

  return res.data;
}

export async function resetPassword(
  token: string,
  password: string,
) {
  const normalizedToken = token.trim();

  if (!normalizedToken) {
    throw new Error(
      'Token de recuperación inválido o expirado',
    );
  }

  if (!password) {
    throw new Error(
      'Introduce una nueva contraseña',
    );
  }

  const res = await api.post('/auth/reset-password', {
    token: normalizedToken,
    password,
  });

  return res.data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/users/me');
  return data;
}