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
