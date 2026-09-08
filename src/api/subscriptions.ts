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

export async function createCheckoutSession(): Promise<{
  url: string;
  sessionId?: string;
}> {
  const { data } = await api.post<{ url: string; sessionId?: string }>(
    '/subscriptions/checkout',
  );
  return data;
}