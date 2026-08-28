import { api } from './client';
import type {
  GeneratedTest,
  AnswerResult,
  TestResult,
} from '../types';

export type TestType =
  | 'GLOBAL'
  | 'PRACTICE'
  | 'REAL'
  | 'SIMULACRO'
  | 'FAILED_ONLY'
  | 'FAVORITES'
  | 'CUSTOM'
  | 'DAILY';

export type TestSelection =
  | 'GLOBAL'
  | 'TOPIC'
  | 'SUBTOPIC'
  | 'ARTICLE';

export interface GenerateTestParams {
  oppositionId: string;
  count: number;

  type?: TestType;

  selection?: TestSelection;

  topicId?: string;
  topicIds?: string[];

  lawId?: string;

  articleId?: string;
  articleIds?: string[];

  difficulty?: string;

  timeLimitSec?: number;

  excludeIds?: string[];
}

export async function generateTest(
  params: GenerateTestParams,
): Promise<GeneratedTest> {
  const { data } = await api.post<GeneratedTest>(
    '/tests/generate',
    params,
  );

  return data;
}

export async function submitAnswer(
  attemptId: string,
  questionId: string,
  selectedAnswerId: string,
  timeSpentMs?: number,
): Promise<AnswerResult> {
  const { data } = await api.post<AnswerResult>(
    `/tests/attempts/${attemptId}/answer`,
    {
      questionId,
      selectedAnswerId,
      timeSpentMs,
    },
  );

  return data;
}

export async function submitBlankAnswer(
  attemptId: string,
  questionId: string,
  timeSpentMs?: number,
): Promise<{
  unanswered: boolean;
  questionId: string;
}> {
  const { data } = await api.post<{
    unanswered: boolean;
    questionId: string;
  }>(
    `/tests/attempts/${attemptId}/answer/blank`,
    {
      questionId,
      timeSpentMs,
    },
  );

  return data;
}

export async function finishTest(
  attemptId: string,
): Promise<TestResult> {
  const { data } = await api.post<TestResult>(
    `/tests/attempts/${attemptId}/finish`,
  );

  return data;
}

/**
 * Genera un test rápido desde el botón Test del Home.
 *
 * Flujo:
 * Home → generar test → pantalla de preguntas.
 *
 * Test normal:
 * - 10 preguntas
 * - Banco completo
 * - PRACTICE
 * - 14:24 de tiempo
 */
export async function generateQuickTest(): Promise<GeneratedTest> {
  const { data } = await api.get('/oppositions');

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : [];

  const opposition =
    list.find(
      (item: any) =>
        item?.code === 'GC' ||
        /guardia\s*civil/i.test(
          item?.name || '',
        ),
    ) || list[0];

  if (!opposition?.id) {
    throw new Error(
      'No se encontró la oposición de Guardia Civil en el servidor.',
    );
  }

  return generateTest({
    oppositionId: opposition.id,
    count: 10,
    type: 'PRACTICE',
    selection: 'GLOBAL',
    timeLimitSec: 864,
  });
}
