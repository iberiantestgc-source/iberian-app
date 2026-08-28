// src/api/ai.ts
// =============================================
// SERVICIO DE IA - LLAMADAS AL BACKEND
// =============================================

import { api } from './client';

// =============================================
// TIPOS
// =============================================

export type EstadoAnimo =
  | 'motivado'
  | 'cansado'
  | 'frustrado'
  | 'ansioso'
  | 'neutro';

export interface PerfilUsuario {
  perfiles: string[];
  principal: string;
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

// =============================================
// TIPOS DEL TUTOR IA
// =============================================

export interface TutorQuestionInput {
  question: string;
  questionId?: string;
  articleId?: string;
  lawId?: string;
}

export interface TutorResponse {
  answer: string;
  contextUsed?: {
    hasUser?: boolean;
    hasQuestion?: boolean;
    hasArticle?: boolean;
    hasLaw?: boolean;
    recentMistakes?: number;
  };
  mode?: 'openai' | 'mock';
  model?: string;
}

// =============================================
// 1. TUTOR IA
// =============================================

/**
 * Envía una pregunta al tutor IA.
 *
 * El token JWT se añade automáticamente mediante
 * el interceptor de src/api/client.ts.
 *
 * Backend:
 * POST /api/v1/ai/tutor
 */
export async function askTutor(
  datos: TutorQuestionInput,
): Promise<TutorResponse> {
  try {
    const response = await api.post<TutorResponse>(
      '/ai/tutor',
      datos,
    );

    return response.data;
  } catch (error: any) {
    console.error(
      '❌ Error preguntando al tutor IA:',
      error?.response?.data || error?.message || error,
    );

    throw error;
  }
}

// =============================================
// 2. GENERAR PLAN DE ESTUDIO CON IA COACH
// =============================================

export async function generarPlanIA(datos: {
  uid: string;
  fechaExamen: string;
  horasDiarias: number;
  diasDescanso?: string[];
  temasDificiles?: string[];
  tiempoEstudiando?: string;
  objetivo?: 'aprobar' | 'nota-alta' | 'nota-maxima';
  nivelFatiga?: 'bajo' | 'medio' | 'alto';
  dispositivo?: string;
  porcentajeDominio: Record<string, number>;
  mensajeUsuario?: string;
  historial: {
    totalTests: number;
    tasaAcierto: number;
    promedioHoras: number;
    temasMasFallados?: string[];
    temasMasAcertados?: string[];
    tendencia?: 'mejorando' | 'estable' | 'empeorando';
    nivelCompromiso?: 'bajo' | 'medio' | 'alto';
    ritmoEstudio?:
      | 'principiante'
      | 'constante'
      | 'intenso'
      | 'excepcional';
    ultimaSemana?: {
      tests: number;
      aciertos: number;
    };
    racha?: number;
  };
  estadoAnimo?: EstadoAnimo;
  tendenciaEmocional?: 'mejorando' | 'estable' | 'empeorando';
  estadosRecientes?: string[];
}) {
  try {
    const response = await api.post(
      '/ia/generar-plan',
      datos,
    );

    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error(
      '❌ Error generando plan con IA:',
      error?.response?.data || error?.message || error,
    );

    throw error;
  }
}

// =============================================
// 3. GENERAR PLAN DE ESTUDIO LEGADO
// =============================================

export async function generarPlanEstudio(datos: {
  fechaExamen: string;
  horasDiarias: number;
  diasDescanso?: string[];
  temasDificiles?: string[];
  tiempoEstudiando?: string;
  objetivo?: 'aprobar' | 'nota-alta' | 'nota-maxima';
  notaMedia?: number;
  porcentajeDominio: Record<string, number>;
}) {
  try {
    const response = await api.post(
      '/ia/plan',
      datos,
    );

    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error(
      '❌ Error generando plan:',
      error?.response?.data || error?.message || error,
    );

    throw error;
  }
}

// =============================================
// 4. REGISTRAR ESTADO DE ÁNIMO
// =============================================

export async function registrarEstadoAnimo(
  estado: EstadoAnimo,
  observaciones?: string,
): Promise<{
  success: boolean;
  plan?: any;
}> {
  try {
    const response = await api.post(
      '/ia/estado-animo',
      {
        estado,
        observaciones,
      },
    );

    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error(
      '❌ Error registrando estado de ánimo:',
      error?.response?.data || error?.message || error,
    );

    throw error;
  }
}

// =============================================
// 5. OBTENER PERFIL DEL USUARIO
// =============================================

export async function obtenerPerfil(
  uid: string,
): Promise<PerfilUsuario> {
  try {
    const response = await api.get(
      `/ia/perfil/${uid}`,
    );

    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error(
      '❌ Error obteniendo perfil:',
      error?.response?.data || error?.message || error,
    );

    throw error;
  }
}

// =============================================
// 6. OBTENER TENDENCIA EMOCIONAL
// =============================================

export async function obtenerTendenciaEmocional(
  uid: string,
  dias: number = 7,
): Promise<TendenciaEmocional> {
  try {
    const response = await api.get(
      `/ia/tendencia/${uid}?dias=${dias}`,
    );

    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error(
      '❌ Error obteniendo tendencia emocional:',
      error?.response?.data || error?.message || error,
    );

    throw error;
  }
}

// =============================================
// 7. OBTENER COMPARATIVA
// =============================================

export async function obtenerComparativa(
  uid: string,
): Promise<ComparativaUsuario> {
  try {
    const response = await api.get(
      `/ia/comparativa/${uid}`,
    );

    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error(
      '❌ Error obteniendo comparativa:',
      error?.response?.data || error?.message || error,
    );

    throw error;
  }
}

// =============================================
// 8. GENERAR TEST PERSONALIZADO
// =============================================

export async function generarTestPersonalizado(
  temas: string[],
  numPreguntas: number = 20,
  dificultad: 'facil' | 'media' | 'dificil' = 'media',
): Promise<any[]> {
  try {
    const response = await api.post(
      '/ia/test-personalizado',
      {
        temas,
        numPreguntas,
        dificultad,
      },
    );

    const data = response.data?.data ?? response.data;

    return data?.preguntas ?? [];
  } catch (error: any) {
    console.error(
      '❌ Error generando test personalizado:',
      error?.response?.data || error?.message || error,
    );

    throw error;
  }
}

// =============================================
// 9. AJUSTAR PLAN SEGÚN ESTADO DE ÁNIMO
// =============================================

export async function ajustarPlanPorEstado(
  estado: EstadoAnimo,
  planActual: any,
  historial: any,
): Promise<any> {
  try {
    const response = await api.post(
      '/ia/ajustar-plan',
      {
        estado,
        planActual,
        historial,
      },
    );

    return response.data?.data ?? response.data;
  } catch (error: any) {
    console.error(
      '❌ Error ajustando plan:',
      error?.response?.data || error?.message || error,
    );

    throw error;
  }
}