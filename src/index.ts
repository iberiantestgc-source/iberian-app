// src/index.ts
// =============================================
// BACKEND PRINCIPAL
// =============================================

const express = require('express');

const cors = require('cors');

const dotenv = require('dotenv');

// =============================================
// TIPOS COMPATIBLES
// =============================================

type Request = any;
type Response = any;
type NextFunction = any;

// =============================================
// DECLARACIONES DE NODE
// =============================================

declare const require: any;
declare const module: any;
declare const process: any;

// =============================================
// CARGAR VARIABLES DE ENTORNO
// =============================================

dotenv.config();

// =============================================
// IMPORTAR IA
// =============================================
//
// Estas funciones pertenecían al backend IA antiguo.
// Se mantienen aquí para conservar las rutas existentes.
//
// Si los archivos antiguos ya no existen, estas
// implementaciones locales permiten que este archivo
// siga siendo válido.
// =============================================

const ajustarPlanPorEstadoAnimo = (
    estado: string,
    planActual: any,
    historial?: any,
) => {
    return {
        ...planActual,
        estadoAnimo: estado,
        historial,
    };
};

const registrarEstadoAnimo = async (
    uid: string,
    estado: string,
    observaciones?: string,
) => {
    return {
        uid,
        estado,
        observaciones,
    };
};

const analizarTendenciaEmocional = async (
    uid: string,
    dias: number,
) => {
    return {
        uid,
        dias,
        tendencia: 'estable',
    };
};

const obtenerEstadoAnimo = async (
    uid: string,
) => {
    return {
        uid,
        estado: null,
    };
};

const detectarPerfil = (
    userData: any,
    historial: any,
) => {
    return {
        userData,
        historial,
    };
};

// =============================================
// IMPORTAR IA COACH
// =============================================
//
// El servicio antiguo puede no existir actualmente.
// Se mantiene una implementación local para conservar
// la ruta existente sin depender de ese archivo.
// =============================================

const generarPlanEstudio = async (
    datos: any,
) => {
    return {
        usuario: {
            ...datos,
        },

        planSemanal: [
            {
                semana: 1,
                objetivo:
                    'Completar temas básicos',
            },
        ],

        mensaje:
            'Plan generado correctamente',
    };
};

const guardarPlan = async (
    uid: string,
    plan: any,
) => {
    console.log(
        '📝 Plan preparado para guardar:',
        uid,
        plan,
    );

    return plan;
};

// =============================================
// CONFIGURACIÓN DE EXPRESS
// =============================================

const app = express();

const PORT = Number(
    process.env.PORT || 3000
);

// =============================================
// MIDDLEWARES
// =============================================

app.use(cors());

app.use(express.json());

// =============================================
// MIDDLEWARE DE ERRORES JSON
// =============================================

app.use(
    (
        err: any,
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        console.error(
            '❌ Error del servidor:',
            err
        );

        if (res.headersSent) {
            return next(err);
        }

        return res.status(500).json({
            success: false,
            error:
                err?.message ||
                'Error interno del servidor',
        });
    }
);

// =============================================
// RUTAS DE PRUEBA
// =============================================

app.get(
    '/',
    (req: Request, res: Response) => {
        return res.json({
            message:
                '✅ Iberian Backend funcionando correctamente',
            timestamp:
                new Date().toISOString(),
        });
    }
);

app.get(
    '/api/health',
    (req: Request, res: Response) => {
        return res.json({
            status: 'ok',
            timestamp:
                new Date().toISOString(),
        });
    }
);

// =============================================
// RUTAS DE AUTENTICACIÓN (SIMULADAS)
// =============================================

// =============================================
// AUTH - LOGIN
// =============================================
app.post(
    '/api/auth/login',
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                email,
                password
            } = req.body || {};

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error:
                        'Email y contraseña son obligatorios',
                });
            }

            console.log(
                '📝 Login:',
                email
            );

            return res.json({
                success: true,
                data: {
                    accessToken:
                        'fake-access-token-' +
                        Date.now(),

                    refreshToken:
                        'fake-refresh-token-' +
                        Date.now(),

                    user: {
                        id: '1',
                        email: email,
                        name:
                            email.split('@')[0] ||
                            'Usuario',
                        role: 'user',
                    },
                },
            });
        } catch (error: any) {
            console.error(
                '❌ Error en login:',
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error?.message ||
                    'Error en el login',
            });
        }
    }
);

// =============================================
// AUTH - REGISTRO
// =============================================
app.post(
    '/api/auth/register',
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                email,
                password,
                name
            } = req.body || {};

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error:
                        'Email y contraseña son obligatorios',
                });
            }

            console.log(
                '📝 Registro:',
                email
            );

            return res.json({
                success: true,
                data: {
                    accessToken:
                        'fake-access-token-' +
                        Date.now(),

                    refreshToken:
                        'fake-refresh-token-' +
                        Date.now(),

                    user: {
                        id: '2',
                        email: email,
                        name:
                            name ||
                            email.split('@')[0] ||
                            'Usuario',
                        role: 'user',
                    },
                },
            });
        } catch (error: any) {
            console.error(
                '❌ Error en registro:',
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error?.message ||
                    'Error en el registro',
            });
        }
    }
);

// =============================================
// AUTH - REFRESH
// =============================================
app.post(
    '/api/auth/refresh',
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                refreshToken
            } = req.body || {};

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    error:
                        'Refresh token es obligatorio',
                });
            }

            return res.json({
                success: true,
                data: {
                    accessToken:
                        'fake-access-token-' +
                        Date.now(),

                    refreshToken:
                        'fake-refresh-token-' +
                        Date.now(),
                },
            });
        } catch (error: any) {
            console.error(
                '❌ Error en refresh:',
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error?.message ||
                    'Error al refrescar el token',
            });
        }
    }
);

// =============================================
// AUTH - LOGOUT
// =============================================
app.post(
    '/api/auth/logout',
    async (
        req: Request,
        res: Response
    ) => {
        console.log(
            '📝 Logout'
        );

        return res.json({
            success: true,
            message:
                'Logout exitoso',
        });
    }
);

// =============================================
// USERS - ME
// =============================================
app.get(
    '/api/users/me',
    async (
        req: Request,
        res: Response
    ) => {
        return res.json({
            id: '1',
            email:
                'usuario@test.com',
            name:
                'Usuario de Prueba',
            role: 'user',

            stats: {
                totalTests: 42,
                averageScore: 72,
                streak: 7,
            },
        });
    }
);

// =============================================
// RUTAS DE IA
// =============================================

// =============================================
// 1. REGISTRAR ESTADO DE ÁNIMO
// =============================================

app.post(
    '/api/ia/estado-animo',
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                uid,
                estado,
                observaciones,
            } = req.body || {};

            if (!uid || !estado) {
                return res.status(400).json({
                    success: false,
                    error:
                        'Faltan datos: uid y estado son obligatorios',
                });
            }

            const result =
                await registrarEstadoAnimo(
                    uid,
                    estado,
                    observaciones
                );

            return res.json({
                ...result,
                success: true,
            });
        } catch (error: any) {
            console.error(
                '❌ Error:',
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error?.message ||
                    'Error al registrar el estado de ánimo',
            });
        }
    }
);

// =============================================
// 2. OBTENER ESTADO DE ÁNIMO
// =============================================

app.get(
    '/api/ia/estado-animo/:uid',
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                uid
            } = req.params;

            const estado =
                await obtenerEstadoAnimo(
                    uid
                );

            return res.json({
                success: true,
                data: {
                    estado,
                },
            });
        } catch (error: any) {
            console.error(
                '❌ Error:',
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error?.message ||
                    'Error al obtener el estado de ánimo',
            });
        }
    }
);

// =============================================
// 3. OBTENER PERFIL DEL USUARIO
// =============================================

app.get(
    '/api/ia/perfil/:uid',
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                uid
            } = req.params;

            if (!uid) {
                return res.status(400).json({
                    success: false,
                    error:
                        'El uid es obligatorio',
                });
            }

            // Datos provisionales.
            // Posteriormente pueden sustituirse
            // por los datos reales de Prisma.

            const userData = {
                horasDiarias: 4,
            };

            const historial = {
                tasaAcierto: 65,
                totalTests: 30,
                promedioHoras: 3.5,
                diasSeguidos: 5,
            };

            const perfil =
                detectarPerfil(
                    userData,
                    historial
                );

            return res.json({
                success: true,
                data: perfil,
            });
        } catch (error: any) {
            console.error(
                '❌ Error:',
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error?.message ||
                    'Error al obtener el perfil',
            });
        }
    }
);

// =============================================
// 4. OBTENER TENDENCIA EMOCIONAL
// =============================================

app.get(
    '/api/ia/tendencia/:uid',
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                uid
            } = req.params;

            const dias =
                Number(
                    req.query.dias
                ) || 7;

            const tendencia =
                await analizarTendenciaEmocional(
                    uid,
                    dias
                );

            return res.json({
                success: true,
                data: tendencia,
            });
        } catch (error: any) {
            console.error(
                '❌ Error:',
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error?.message ||
                    'Error al analizar la tendencia emocional',
            });
        }
    }
);

// =============================================
// 5. AJUSTAR PLAN SEGÚN ESTADO DE ÁNIMO
// =============================================

app.post(
    '/api/ia/ajustar-plan',
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                estado,
                planActual,
                historial,
            } = req.body || {};

            if (
                !estado ||
                !planActual
            ) {
                return res.status(400).json({
                    success: false,
                    error:
                        'Faltan datos: estado y planActual son obligatorios',
                });
            }

            const planAjustado =
                ajustarPlanPorEstadoAnimo(
                    estado,
                    planActual,
                    historial
                );

            return res.json({
                success: true,
                data: planAjustado,
            });
        } catch (error: any) {
            console.error(
                '❌ Error:',
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error?.message ||
                    'Error al ajustar el plan',
            });
        }
    }
);

// =============================================
// 6. GENERAR TEST PERSONALIZADO
// =============================================

app.post(
    '/api/ia/test-personalizado',
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const {
                temas,
                numPreguntas = 20,
            } = req.body || {};

            if (
                !temas ||
                !Array.isArray(
                    temas
                )
            ) {
                return res.status(400).json({
                    success: false,
                    error:
                        'El campo temas es obligatorio y debe ser un array',
                });
            }

            const preguntas =
                temas.map(
                    (
                        tema: string
                    ) => ({
                        id:
                            `preg_${Math.random()
                                .toString(36)
                                .substring(2, 7)}`,

                        tema,

                        texto:
                            `¿Pregunta de ejemplo sobre ${tema}?`,

                        opciones: [
                            'Opción A',
                            'Opción B',
                            'Opción C',
                            'Opción D',
                        ],

                        correcta: 0,
                    })
                );

            const cantidad =
                Math.max(
                    1,
                    Number(
                        numPreguntas
                    ) || 20
                );

            return res.json({
                success: true,
                data: {
                    preguntas:
                        preguntas.slice(
                            0,
                            cantidad
                        ),
                },
            });
        } catch (error: any) {
            console.error(
                '❌ Error:',
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error?.message ||
                    'Error al generar el test personalizado',
            });
        }
    }
);

// =============================================
// 7. GENERAR PLAN DE ESTUDIO (SIMULADO)
// =============================================

app.post(
    '/api/ia/plan',
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const datos =
                req.body ||
                {};

            console.log(
                '📝 Generando plan para:',
                datos
            );

            const plan = {
                usuario: {
                    ...datos,
                },

                planSemanal: [
                    {
                        semana: 1,
                        objetivo:
                            'Completar temas básicos',
                    },
                ],

                mensaje:
                    'Plan generado correctamente (simulado)',
            };

            return res.json({
                success: true,
                data: plan,
            });
        } catch (error: any) {
            console.error(
                '❌ Error:',
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error?.message ||
                    'Error al generar el plan',
            });
        }
    }
);

// =============================================
// 8. GENERAR PLAN DE ESTUDIO CON IA COACH
// =============================================

app.post(
    '/api/ia/generar-plan',
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const body =
                req.body || {};

            const uid =
                body.uid;

            const datos = {
                ...body,
            };

            delete datos.uid;

            if (!uid) {
                return res.status(400).json({
                    success: false,
                    error:
                        'El uid es obligatorio',
                });
            }

            if (!datos.fechaExamen) {
                return res.status(400).json({
                    success: false,
                    error:
                        'La fecha del examen es obligatoria',
                });
            }

            if (!datos.horasDiarias) {
                return res.status(400).json({
                    success: false,
                    error:
                        'Las horas diarias son obligatorias',
                });
            }

            if (!datos.porcentajeDominio) {
                return res.status(400).json({
                    success: false,
                    error:
                        'El porcentaje de dominio es obligatorio',
                });
            }

            console.log(
                '🤖 Generando plan con IA Coach para:',
                uid
            );

            const plan =
                await generarPlanEstudio(
                    datos
                );

            try {
                await guardarPlan(
                    uid,
                    plan
                );
            } catch (
                saveError
            ) {
                console.warn(
                    '⚠️ No se pudo guardar el plan:',
                    saveError
                );
            }

            return res.json({
                success: true,
                data: plan,
            });

        } catch (
            error: any
        ) {
            console.error(
                '❌ Error en /api/ia/generar-plan:',
                error
            );

            return res.status(500).json({
                success: false,
                error:
                    error?.message ||
                    'Error al generar el plan con IA',
            });
        }
    }
);

// =============================================
// RUTA 404
// =============================================

app.use(
    (
        req: Request,
        res: Response
    ) => {
        console.log(
            `❌ 404: ${req.method} ${req.url}`
        );

        return res.status(404).json({
            success: false,
            error:
                `Ruta no encontrada: ${req.method} ${req.url}`,
        });
    }
);

// =============================================
// INICIAR SERVIDOR
// =============================================

if (
    require.main === module
) {
    app.listen(
        PORT,
        () => {
            console.log(
                `✅ Servidor corriendo en http://localhost:${PORT}`
            );

            console.log(
                `📊 Health check: http://localhost:${PORT}/api/health`
            );

            console.log(
                '🤖 IA endpoints disponibles en /api/ia/'
            );

            console.log(
                '🧠 IA Coach endpoint: POST /api/ia/generar-plan'
            );

            console.log(
                '🔐 Auth endpoints disponibles en /api/auth/'
            );
        }
    );
}

// =============================================
// EXPORTAR PARA TESTS
// =============================================

export default app;