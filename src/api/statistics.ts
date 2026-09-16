import { api } from './client';
import type { UserStats } from '../types';

/**
 * Unifica posibles nombres del backend para la UI de progreso.
 */
function normalizeStats(raw: any): UserStats & {
  correctAnswers: number;
  wrongCount: number;
  unansweredCount: number;
  testsCompleted: number;
  totalQuestions: number;
  accuracy: number;
  dailyStreak: number;
  xp: number;
} {
  const totalQuestions = Number(
    raw?.totalQuestions ?? raw?.questionsAnswered ?? 0,
  );
  const correctAnswers = Number(
    raw?.correctAnswers ?? raw?.correctCount ?? 0,
  );
  const unansweredCount = Number(
    raw?.unansweredCount ?? raw?.blankCount ?? 0,
  );
  const wrongCount = Number(
    raw?.wrongCount ??
      raw?.incorrectAnswers ??
      Math.max(0, totalQuestions - correctAnswers - unansweredCount),
  );

  const accuracy =
    raw?.accuracy != null
      ? Number(raw.accuracy)
      : totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

  return {
    ...raw,
    xp: Number(raw?.xp ?? 0),
    dailyStreak: Number(raw?.dailyStreak ?? 0),
    totalQuestions,
    correctAnswers,
    wrongCount,
    unansweredCount,
    testsCompleted: Number(
      raw?.testsCompleted ?? raw?.totalTests ?? 0,
    ),
    accuracy,
  };
}

export async function getMyStats(): Promise<UserStats> {
  const { data } = await api.get<UserStats>('/statistics/me');
  return normalizeStats(data) as UserStats;
}

export async function getTopicStats(oppositionId?: string) {
  const { data } = await api.get('/statistics/me/topics', {
    params: { oppositionId },
  });
  return data;
}