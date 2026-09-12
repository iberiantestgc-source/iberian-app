// src/api/client.ts
// =============================================
// CLIENTE HTTP PRINCIPAL DE IBERIAN
// =============================================

import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

import { Platform } from 'react-native';

import * as SecureStore from 'expo-secure-store';

// =============================================
// CONFIGURACIÓN DE LA API
// =============================================
//
// BACKEND PRODUCCIÓN:
// https://iberian-backend.onrender.com
//
// API:
// https://iberian-backend.onrender.com/api/v1
//
// Si existe EXPO_PUBLIC_API_URL, se utilizará
// esa URL. En caso contrario, se utilizará
// automáticamente el backend de producción.
//
// Local (opcional, en .env de la app):
// EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
// =============================================

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://iberian-backend.onrender.com/api/v1';

// =============================================
// EXPORTAR URL
// =============================================
//
// Útil para depuración y para otros módulos
// que necesiten conocer la URL activa.
// =============================================

export { API_URL };

// =============================================
// CLIENTE AXIOS
// =============================================

export const api = axios.create({
  baseURL: API_URL,
  // Render (plan free) puede tardar al despertar;
  // tutor IA + Gemini pueden superar 30s.
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================================
// CLAVES DE ALMACENAMIENTO
// =============================================

const TOKEN_KEY = 'iberian_access';
const REFRESH_KEY = 'iberian_refresh';

// =============================================
// ALMACENAMIENTO SEGURO
// =============================================

async function setItem(
  key: string,
  value: string,
): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }

    return;
  }

  await SecureStore.setItemAsync(key, value);
}

// =============================================

async function getItem(
  key: string,
): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }

    return null;
  }

  return SecureStore.getItemAsync(key);
}

// =============================================

async function deleteItem(
  key: string,
): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }

    return;
  }

  await SecureStore.deleteItemAsync(key);
}

// =============================================
// TOKENS
// =============================================

export async function saveTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await setItem(TOKEN_KEY, accessToken);
  await setItem(REFRESH_KEY, refreshToken);
}

// =============================================

export async function clearTokens(): Promise<void> {
  await deleteItem(TOKEN_KEY);
  await deleteItem(REFRESH_KEY);
}

// =============================================

export async function getAccessToken(): Promise<
  string | null
> {
  return getItem(TOKEN_KEY);
}

// =============================================

export async function getRefreshToken(): Promise<
  string | null
> {
  return getItem(REFRESH_KEY);
}

// =============================================
// INTERCEPTOR DE PETICIONES
// =============================================
//
// Añade automáticamente:
//
// Authorization: Bearer <accessToken>
//
// a las peticiones autenticadas.
// =============================================

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const isPublicAuthRoute =
      config.url === '/auth/login' ||
      config.url === '/auth/register' ||
      config.url === '/auth/forgot-password' ||
      config.url === '/auth/reset-password' ||
      config.url === '/auth/refresh';

    if (!isPublicAuthRoute) {
      const token = await getAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// =============================================
// REFRESH TOKEN
// =============================================
//
// Evitamos ejecutar varios refresh simultáneos
// cuando varias peticiones reciben 401 al mismo
// tiempo.
// =============================================

let refreshing: Promise<string | null> | null = null;

// =============================================
// INTERCEPTOR DE RESPUESTAS
// =============================================

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    // ===========================================
    // Si no es 401, devolver el error directamente
    // ===========================================

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // ===========================================
    // NO INTENTAR REFRESH EN RUTAS PÚBLICAS
    // ===========================================

    const isPublicAuthRoute =
      originalRequest.url === '/auth/login' ||
      originalRequest.url === '/auth/register' ||
      originalRequest.url === '/auth/forgot-password' ||
      originalRequest.url === '/auth/reset-password' ||
      originalRequest.url === '/auth/refresh';

    if (isPublicAuthRoute) {
      return Promise.reject(error);
    }

    // ===========================================
    // Evitar bucles infinitos
    // ===========================================

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // ===========================================
    // CREAR REFRESH EN CURSO
    // ===========================================

    if (!refreshing) {
      refreshing = (async () => {
        try {
          const refreshToken = await getRefreshToken();

          if (!refreshToken) {
            return null;
          }

          // =====================================
          // IMPORTANTE:
          //
          // Usamos axios directamente aquí,
          // no "api", para evitar que el interceptor
          // vuelva a interceptar el refresh.
          // =====================================

          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            {
              refreshToken,
            },
            {
              timeout: 60000,
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );

          const data = response.data;

          if (
            !data ||
            typeof data.accessToken !== 'string' ||
            typeof data.refreshToken !== 'string'
          ) {
            await clearTokens();

            return null;
          }

          await saveTokens(data.accessToken, data.refreshToken);

          return data.accessToken;
        } catch (refreshError) {
          console.error(
            '[IBERIAN] Error renovando token:',
            refreshError,
          );

          await clearTokens();

          return null;
        } finally {
          refreshing = null;
        }
      })();
    }

    // ===========================================
    // ESPERAR AL REFRESH
    // ===========================================

    const newAccessToken = await refreshing;

    // ===========================================
    // REINTENTAR PETICIÓN ORIGINAL
    // ===========================================

    if (newAccessToken && originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    }

    // ===========================================
    // NO SE PUDO RENOVAR
    // ===========================================

    return Promise.reject(error);
  },
);

// =============================================
// EXPORTACIÓN POR DEFECTO
// =============================================

export default api;