import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as authApi from '../../src/api/auth';
import IberianLynxIcon from '../../src/components/IberianLynxIcon';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{
    token?: string | string[];
  }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token =
    typeof params.token === 'string'
      ? params.token
      : Array.isArray(params.token)
        ? String(params.token[0] || '')
        : '';

  const hasValidToken = !!token;

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');

    if (!hasValidToken) {
      setError(
        'El enlace de recuperación no es válido o ha expirado.',
      );
      return;
    }

    if (!password || !confirmPassword) {
      setError(
        'Introduce la nueva contraseña y su confirmación.',
      );
      return;
    }

    if (password.length < 8) {
      setError(
        'La contraseña debe tener al menos 8 caracteres.',
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        'Las contraseñas no coinciden.',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.resetPassword(
        token,
        password,
      );

      setPassword('');
      setConfirmPassword('');

      setSuccess(
        response?.message ||
          'Contraseña restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.',
      );
    } catch (e: any) {
      const text =
        e?.response?.data?.message ||
        e?.message ||
        'No se pudo restablecer la contraseña.';

      setError(
        Array.isArray(text)
          ? text.join('\n')
          : String(text),
      );

      console.log(
        'RESET PASSWORD ERROR:',
        e,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <IberianLynxIcon size={130} />

          <Text style={styles.logo}>
            IBERIAN
          </Text>

          <Text style={styles.subtitle}>
            Recupera el acceso a tu cuenta
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>
            Nueva contraseña
          </Text>

          {!hasValidToken ? (
            <>
              <Text style={styles.description}>
                El enlace de recuperación no es válido
                o no contiene el código de seguridad
                necesario para cambiar tu contraseña.
              </Text>

              <Text style={styles.error}>
                Debes acceder desde el enlace que
                recibirás en tu correo electrónico.
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  router.replace('/(auth)/forgot-password')
                }
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  Solicitar nuevo enlace
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.description}>
                Introduce una nueva contraseña para
                proteger tu cuenta de IBERIAN.
              </Text>

              <Text style={styles.label}>
                Nueva contraseña
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor="#8B9BB4"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />

              <Text style={styles.label}>
                Repetir contraseña
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Repite la contraseña"
                placeholderTextColor="#8B9BB4"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />

              {error ? (
                <Text style={styles.error}>
                  {error}
                </Text>
              ) : null}

              {success ? (
                <Text style={styles.success}>
                  {success}
                </Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.button,
                  loading &&
                    styles.buttonDisabled,
                ]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator
                    color="#0B1C2C"
                  />
                ) : (
                  <Text style={styles.buttonText}>
                    Cambiar contraseña
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.linkBtn}
            activeOpacity={0.8}
            onPress={() =>
              router.replace('/(auth)/login')
            }
          >
            <Text style={styles.linkText}>
              ¿Quieres volver al login?{' '}
              <Text
                style={styles.linkHighlight}
              >
                Entrar
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1C2C',
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 40,
  },

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logo: {
    marginTop: 8,
    fontSize: 36,
    fontWeight: '800',
    color: '#F5F7FA',
    letterSpacing: 2,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#8B9BB4',
    textAlign: 'center',
  },

  form: {
    gap: 8,
  },

  title: {
    color: '#F5F7FA',
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },

  description: {
    color: '#8B9BB4',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 12,
  },

  label: {
    color: '#8B9BB4',
    fontSize: 13,
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '600',
  },

  input: {
    backgroundColor: '#13253A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#F5F7FA',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#1E3A56',
  },

  error: {
    marginTop: 12,
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },

  success: {
    marginTop: 12,
    color: '#86EFAC',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#C9A227',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#0B1C2C',
    fontSize: 16,
    fontWeight: '800',
  },

  linkBtn: {
    marginTop: 20,
    alignItems: 'center',
  },

  linkText: {
    color: '#8B9BB4',
    fontSize: 14,
  },

  linkHighlight: {
    color: '#C9A227',
    fontWeight: '700',
  },
});