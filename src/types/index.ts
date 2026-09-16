export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  role: 'USER' | 'PREMIUM' | 'ADMIN' | 'SUPER_ADMIN';
  xp: number;
  level: number;
  dailyStreak?: number;
  totalQuestions?: number;
  correctAnswers?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Answer {
  id: string;
  text: string;
  order: number;
}

export interface Question {
  id: string;
  order?: number;
  statement: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  answers: Answer[];
  topic?: { id: string; name: string; code?: string };
  article?: { id: string; number: string; name?: string };
  law?: { id: string; shortName?: string };
}

export interface GeneratedTest {
  attemptId: string;
  testId: string;
  type: string;
  totalQuestions: number;
  timeLimitSec: number | null;
  questions: Question[];
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswerId?: string;
  explanation?: string;
}

export interface TestResult {
  attemptId: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  xpEarned: number;
  timeSpentSec: number;
  dailyStreak: number;
  newAchievements: { code: string; name: string; xpReward: number }[];
  percentage?: number;
}

export interface UserStats {
  xp: number;
  level: number;
  dailyStreak: number;
  totalQuestions: number;
  correctAnswers: number;
  /** Fallos acumulados (si el backend no lo envía, se calcula en statistics.ts) */
  wrongCount?: number;
  /** En blanco acumulados */
  unansweredCount?: number;
  accuracy: number;
  testsCompleted: number;
  lastStudyDate?: string;
  last7Days: { correct: number; wrong: number; total: number };
}

export interface Opposition {
  id: string;
  name: string;
  code: string;
  description?: string;
}

// =============================================
// NUEVOS TIPOS PARA IA - AÑADIR AL FINAL
// =============================================

export type EstadoAnimo =
  | 'motivado'
  | 'cansado'
  | 'frustrado'
  | 'ansioso'
  | 'neutro';

export type PerfilOpositor =
  | 'trabajador'
  | 'tiempo_completo'
  | 'frustrado'
  | 'perfeccionista'
  | 'inconstante'
  | 'ansioso'
  | 'disciplinado'
  | 'novato';

export interface PerfilUsuario {
  perfiles: PerfilOpositor[];
  principal: PerfilOpositor;
  descripcion: string;
  consejos: string[];
  recomendaciones: {
    duracionSesiones: number;
    numeroTestsDiarios: number;
    dificultadRecomendada: 'facil' | 'media' | 'dificil';
  };
}

export interface TendenciaEmocional {
  estados: EstadoAnimo[];
  estadoPredominante: EstadoAnimo;
  tendencia: 'mejorando' | 'estable' | 'empeorando';
  mensaje: string;
}

export interface ComparativaUsuario {
  usuario: {
    tasaAcierto: number;
    totalTests: number;
    promedioHoras: number;
    racha: number;
  };
  percentiles: {
    tasaAcierto: number;
    totalTests: number;
    promedioHoras: number;
    racha: number;
  };
  mensajes: {
    tasaAcierto: string;
    totalTests: string;
    promedioHoras: string;
    racha: string;
  };
  totalUsuariosComparables: number;
}