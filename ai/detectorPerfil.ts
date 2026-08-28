// functions/src/ia/detectorPerfil.ts
// =============================================
// DETECTOR DE PERFIL DEL USUARIO - BACKEND
// =============================================

export type PerfilOpositor =
    | 'trabajador'
    | 'tiempo_completo'
    | 'frustrado'
    | 'perfeccionista'
    | 'inconstante'
    | 'ansioso'
    | 'disciplinado'
    | 'novato';

export function detectarPerfil(datos: any, historial: any): any {
    const perfiles: PerfilOpositor[] = [];
    const horas = datos?.horasDiarias || 0;
    const tasaAcierto = historial?.tasaAcierto || 0;
    const totalTests = historial?.totalTests || 0;
    const horasEstudiadasReales = historial?.promedioHoras || 0;
    const diasSeguidos = historial?.diasSeguidos || 0;

    // Detectar por horas disponibles
    if (horas <= 3 && horasEstudiadasReales <= 3) {
        perfiles.push('trabajador');
    } else if (horas >= 5 && horasEstudiadasReales >= 4) {
        perfiles.push('tiempo_completo');
    }

    // Detectar por rendimiento
    if (tasaAcierto < 40 && totalTests > 10) {
        perfiles.push('frustrado');
    } else if (tasaAcierto > 80 && totalTests < 50) {
        perfiles.push('perfeccionista');
    }

    // Detectar por constancia
    if (horasEstudiadasReales < horas * 0.6 && totalTests < 20) {
        perfiles.push('inconstante');
    } else if (diasSeguidos > 20) {
        perfiles.push('disciplinado');
    }

    if (totalTests < 10) {
        perfiles.push('novato');
    }

    // Perfil principal
    const prioridad: Record<PerfilOpositor, number> = {
        frustrado: 10,
        ansioso: 9,
        inconstante: 8,
        perfeccionista: 7,
        trabajador: 6,
        tiempo_completo: 5,
        disciplinado: 4,
        novato: 3
    };

    const principal = perfiles.length > 0
        ? perfiles.sort((a, b) => (prioridad[b] || 0) - (prioridad[a] || 0))[0]
        : 'disciplinado';

    const consejosMap: Record<PerfilOpositor, string[]> = {
        trabajador: [
            '⏰ Estudias pocas horas. Prioriza los TESTS sobre la teoría.',
            '📱 Aprovecha tiempos muertos (transporte, esperas) para tests rápidos.',
            '📅 Los fines de semana son tu mejor aliado. Aprovéchalos al máximo.'
        ],
        tiempo_completo: [
            '📚 Tienes tiempo para profundizar. Dedica sesiones de 2h a cada tema.',
            '🎯 Haz SIMULACROS completos una vez por semana.',
            '🔥 No estudies más de 6h diarias. La calidad importa más que la cantidad.'
        ],
        frustrado: [
            '😤 La frustración es normal. Vuelve a la teoría antes de hacer tests.',
            '📖 Relee los temas que te están costando. Subraya lo más importante.',
            '🎯 Empieza con tests de 10 preguntas para ir ganando confianza.'
        ],
        perfeccionista: [
            '🎯 No necesitas un 10 en cada test. Haz más cantidad.',
            '📊 La constancia es más importante que la perfección.',
            '⏱️ Practica con cronómetro. El tiempo importa.'
        ],
        inconstante: [
            '📅 La constancia es la clave del éxito. Establece un horario fijo.',
            '🎯 Objetivo mínimo: 2 tests al día, aunque sean cortos.',
            '🔥 La racha es tu aliada. Cada día que estudias, celebras.'
        ],
        ansioso: [
            '😰 No contestes preguntas que no sepas. La penalización es real.',
            '🧘 Antes de cada test, respira hondo 3 veces.',
            '🎯 Objetivo: 80 preguntas contestadas. Sin presión, sin ansiedad.'
        ],
        disciplinado: [
            '🏆 Eres un ejemplo de constancia. Sigue así y aprobarás.',
            '📈 Ahora enfócate en la CALIDAD, no en la cantidad.',
            '🎯 Tu objetivo: subir la tasa de acierto al 85%+ con tests más difíciles.'
        ],
        novato: [
            '🌱 Bienvenido al mundo de la oposición. El primer paso siempre es el más difícil.',
            '📖 Empieza por leer el temario COMPLETO antes de hacer tests.',
            '🎯 Haz 1 test diario para ir familiarizándote con el formato.'
        ]
    };

    const consejos = perfiles.flatMap(p => consejosMap[p] || []).slice(0, 5);

    const descripciones: Record<PerfilOpositor, string> = {
        trabajador: '📋 Opositor que compagina estudio con trabajo. Poco tiempo, mucha voluntad.',
        tiempo_completo: '🎓 Opositor a tiempo completo. Mucho tiempo, mucho potencial.',
        frustrado: '😤 Opositor que está pasando por una mala racha. Necesita recuperar confianza.',
        perfeccionista: '🎯 Opositor que busca la perfección en cada test. A veces eso le frena.',
        inconstante: '📅 Opositor irregular. Tiene potencial pero le falta constancia.',
        ansioso: '😰 Opositor que se bloquea con la presión. Necesita técnicas de relajación.',
        disciplinado: '🏆 Opositor modelo. Constante, organizado y con buena actitud.',
        novato: '🌱 Opositor principiante. Todo por descubrir, todo por aprender.'
    };

    return {
        perfiles,
        principal,
        descripcion: descripciones[principal] || 'Perfil equilibrado.',
        consejos,
        recomendaciones: {
            duracionSesiones: perfiles.includes('trabajador') ? 20 : 45,
            numeroTestsDiarios: perfiles.includes('trabajador') ? 3 : 5,
            dificultadRecomendada: perfiles.includes('frustrado') ? 'facil' : 'media'
        }
    };
}