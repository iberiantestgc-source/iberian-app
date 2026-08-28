import React from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { generarPlanIA } from '../../api/ai';

// =============================================
// TIPOS
// =============================================

interface PlanGenerado {
  usuario?: {
    fechaExamen?: string;
    diasHastaExamen?: number;
    horasDiarias?: number;
    objetivo?: string;
  };
  predicciones?: {
    notaEstimada?: number;
    notaProyectada?: number;
    probabilidadAprobar?: string;
  };
  planSemanal?: any[];
  mensajesMotivacion?: string[];
  alertas?: any[];
}

// =============================================
// COMPONENTE
// =============================================

export default function HomeScreen() {
  const [cargando, setCargando] = React.useState<boolean>(false);
  const [plan, setPlan] = React.useState<PlanGenerado | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // =============================================
  // FUNCIÓN: PROBAR IA
  // =============================================

  const probarIA = async () => {
    setCargando(true);
    setError(null);
    setPlan(null);

    try {
      console.log('🚀 Probando IA...');

      const resultado = await generarPlanIA({
        uid: 'test123',
        fechaExamen: '2027-06-15',
        horasDiarias: 4,
        diasDescanso: ['Domingos'],
        temasDificiles: ['Tema 7'],
        tiempoEstudiando: '2 meses',
        objetivo: 'nota-alta',
        nivelFatiga: 'medio',
        dispositivo: 'todos',
        porcentajeDominio: {
          'Tema 1': 85,
          'Tema 2': 80,
          'Tema 3': 75,
          'Tema 4': 70,
        },
        historial: {
          totalTests: 45,
          tasaAcierto: 65,
          promedioHoras: 3.5,
          temasMasFallados: ['Tema 7'],
          temasMasAcertados: ['Tema 1'],
          tendencia: 'mejorando',
          nivelCompromiso: 'alto',
          ritmoEstudio: 'constante',
          ultimaSemana: { tests: 10, aciertos: 7 },
          racha: 5,
        },
        estadoAnimo: 'motivado',
      });

      setPlan(resultado);
      console.log('✅ Plan generado exitosamente');
      Alert.alert('Éxito', 'Plan de estudio generado correctamente');

    } catch (err: any) {
      const mensaje = err?.message || 'Error desconocido';
      setError(mensaje);
      console.error('❌ Error:', mensaje);
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  // =============================================
  // RENDER
  // =============================================

  return (
    <ScrollView style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>🧠 Prueba de IA Coach</Text>
      <Text style={styles.subtitle}>
        Genera un plan de estudio personalizado con IA
      </Text>

      {/* Botón */}
      <View style={styles.buttonContainer}>
        <Button
          title={cargando ? 'Generando...' : '📚 Generar Plan de Estudio'}
          onPress={probarIA}
          disabled={cargando}
          color="#4CAF50"
        />
      </View>

      {/* Loading */}
      {cargando && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Generando tu plan personalizado...</Text>
        </View>
      )}

      {/* Error */}
      {error && !cargando && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>
            💡 Verifica que el backend esté corriendo en http://localhost:3000
          </Text>
        </View>
      )}

      {/* Resultado */}
      {plan && !cargando && (
        <View style={styles.planContainer}>
          <Text style={styles.planTitle}>✅ Plan Generado</Text>

          {/* Datos del usuario */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Datos del usuario</Text>
            <Text style={styles.planText}>
              📅 Examen: {plan.usuario?.fechaExamen || 'No disponible'}
            </Text>
            <Text style={styles.planText}>
              ⏰ Días restantes: {plan.usuario?.diasHastaExamen || 'N/A'}
            </Text>
            <Text style={styles.planText}>
              📚 Horas diarias: {plan.usuario?.horasDiarias || 'N/A'}h
            </Text>
            <Text style={styles.planText}>
              🎯 Objetivo: {plan.usuario?.objetivo || 'N/A'}
            </Text>
          </View>

          {/* Predicciones */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Predicciones</Text>
            <Text style={styles.planText}>
              📈 Nota estimada: {plan.predicciones?.notaEstimada || 'N/A'}/10
            </Text>
            <Text style={styles.planText}>
              🚀 Nota proyectada: {plan.predicciones?.notaProyectada || 'N/A'}/10
            </Text>
            <Text style={styles.planText}>
              🏆 Probabilidad de aprobar: {plan.predicciones?.probabilidadAprobar || 'N/A'}
            </Text>
          </View>

          {/* Plan semanal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Plan Semanal</Text>
            <Text style={styles.planText}>
              📚 Semanas planificadas: {plan.planSemanal?.length || 0}
            </Text>
            {plan.planSemanal && plan.planSemanal.length > 0 && (
              <Text style={styles.planText}>
                📖 Primera semana: {plan.planSemanal[0]?.objetivoSemana || 'N/A'}
              </Text>
            )}
          </View>

          {/* Mensajes de motivación */}
          {plan.mensajesMotivacion && plan.mensajesMotivacion.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💪 Mensajes de motivación</Text>
              {plan.mensajesMotivacion.map((msg: string, i: number) => (
                <Text key={i} style={styles.motivationText}>
                  • {msg}
                </Text>
              ))}
            </View>
          )}

          {/* Alertas */}
          {plan.alertas && plan.alertas.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Alertas</Text>
              {plan.alertas.map((alerta: any, i: number) => (
                <Text key={i} style={styles.alertaText}>
                  • {alerta.nivel}: {alerta.mensaje}
                </Text>
              ))}
            </View>
          )}

          <Text style={styles.footer}>
            ✅ Plan generado correctamente. Revisa la consola para más detalles.
          </Text>
        </View>
      )}

      {/* Mensaje inicial */}
      {!plan && !cargando && !error && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            👆 Pulsa el botón "Generar Plan de Estudio" para probar la IA.
          </Text>
          <Text style={styles.infoText}>
            Asegúrate de que el backend esté corriendo en localhost:3000.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// =============================================
// ESTILOS
// =============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ef9a9a',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
  },
  errorHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#90caf9',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#0d47a1',
    textAlign: 'center',
    marginBottom: 4,
  },
  planContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginTop: 16,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  planText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  motivationText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
    fontStyle: 'italic',
  },
  alertaText: {
    fontSize: 14,
    color: '#e65100',
    marginBottom: 3,
  },
  footer: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});