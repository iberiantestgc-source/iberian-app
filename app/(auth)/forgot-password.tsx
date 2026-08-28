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
import { Link } from 'expo-router';
import * as authApi from '../../src/api/auth';
import IberianLynxIcon from '../../src/components/IberianLynxIcon';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleForgotPassword = async () => {
    setError('');
    setSuccess('');

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Introduce tu email');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.forgotPassword(
        normalizedEmail,
      );

      setSuccess(
        response?.message ||
          'Si el email está registrado, recibirás las instrucciones para recuperar tu contraseña.',
      );
    } catch (e: any) {
      const text =
        e?.response?.data?.message ||
        e?.message ||
        'No se pudo procesar la solicitud';

      setError(
        Array.isArray(text)
          ? text.join('\n')
          : String(text),
      );

      console.log(
        'FORGOT PASSWORD ERROR:',
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
            ¿Has olvidado tu contraseña?
          </Text>

          <Text style={styles.description}>
            Introduce el email con el que te
            registraste y te enviaremos las
            instrucciones para recuperar tu
            contraseña.
          </Text>

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="tu@email.com"
            placeholderTextColor="#8B9BB4"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
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
            onPress={handleForgotPassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator
                color="#0B1C2C"
              />
            ) : (
              <Text style={styles.buttonText}>
                Enviar instrucciones
              </Text>
            )}
          </TouchableOpacity>

          <Link
            href="/(auth)/login"
            asChild
          >
            <TouchableOpacity
              style={styles.linkBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.linkText}>
                ¿Recuerdas tu contraseña?{' '}
                <Text
                  style={
                    styles.linkHighlight
                  }
                >
                  Volver al login
                </Text>
              </Text>
            </TouchableOpacity>
          </Link>
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
  },

  success: {
    marginTop: 12,
    color: '#86EFAC',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
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