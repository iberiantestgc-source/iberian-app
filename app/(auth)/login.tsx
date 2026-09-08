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
import { Link, router } from 'expo-router';
import { useAuthStore } from '../../src/context/authStore';
import IberianLynxIcon from '../../src/components/IberianLynxIcon';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Introduce email y contraseña');
      return;
    }

    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);

      setTimeout(() => {
        router.replace('/(tabs)');
      }, 50);
    } catch (e: any) {
      const text =
        e?.response?.data?.message ||
        e?.message ||
        'No se pudo iniciar sesión';

      const finalText = Array.isArray(text)
        ? text.join('\n')
        : String(text);

      setError(finalText);
      console.log('LOGIN ERROR:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <IberianLynxIcon size={150} />

          <Text style={styles.logo}>IBERIAN</Text>

          <Text style={styles.subtitle}>
            Prepara tu oposición para Guardia Civil
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>

          <TextInput
            style={styles.input}
            placeholder="Introduce tu correo electrónico"
            placeholderTextColor="#8B9BB4"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Contraseña</Text>

          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#8B9BB4"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity
              style={styles.forgotBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.forgotText}>
                ¿Has olvidado tu contraseña?
              </Text>
            </TouchableOpacity>
          </Link>

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#0B1C2C" />
            ) : (
              <Text style={styles.buttonText}>
                Entrar
              </Text>
            )}
          </TouchableOpacity>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity
              style={styles.linkBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.linkText}>
                ¿No tienes cuenta?{' '}
                <Text style={styles.linkHighlight}>
                  Regístrate
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

  forgotBtn: {
    alignItems: 'flex-end',
    marginTop: 2,
  },

  forgotText: {
    color: '#C9A227',
    fontSize: 13,
    fontWeight: '700',
  },

  error: {
    marginTop: 12,
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '600',
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