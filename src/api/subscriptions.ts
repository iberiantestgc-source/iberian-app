import { api } from './client';

export async function getMySubscription() {
  const { data } = await api.get('/subscriptions/me');
  return data as {
    subscription: {
      status: string;
      plan: string;
      endDate?: string;
    };
    limits: {
      plan: string;
      dailyQuestions: number;
      canUseAI: boolean;
      unlimitedSimulacros: boolean;
    };
  };
}

/**
 * Crea una sesión de Stripe Checkout en el backend.
 * Devuelve la URL a la que hay que redirigir al usuario.
 *
 * POST /subscriptions/checkout
 * Requiere estar autenticado (Bearer token).
 */
export async function createCheckoutSession(): Promise<{
  url: string;
  sessionId?: string;
}> {
  const { data } = await api.post<{
    url: string;
    sessionId?: string;
  }>('/subscriptions/checkout');

  if (!data || typeof data.url !== 'string' || data.url.length === 0) {
    throw new Error('El servidor no devolvió una URL de pago válida');
  }

  return data;
}