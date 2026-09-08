import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '../../src/context/authStore';
import IberianLynxIcon from '../../src/components/IberianLynxIcon';

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert(
        'Error',
        'Email y contraseña son obligatorios',
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        'Error',
        'La contraseña debe tener al menos 8 caracteres',
      );
      return;
    }

    setLoading(true);

    try {
      await register(
        email.trim().toLowerCase(),
        password,
        name || undefined,
      );

      router.replace('/(tabs)');
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message;

      let text = 'No se pudo registrar';

      if (!e?.response) {
        text =
          'No se pudo conectar con el servidor. ¿Está el backend en marcha?';
      } else if (status === 409) {
        text = 'Ese email ya está registrado';
      } else if (msg) {
        text = Array.isArray(msg)
          ? msg.join('\n')
          : String(msg);
      }

      Alert.alert('Error', text);
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
            Crea tu cuenta
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre</Text>

          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor="#8B9BB4"
            value={name}
            onChangeText={setName}
          />

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
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#8B9BB4"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#0B1C2C" />
            ) : (
              <Text style={styles.buttonText}>
                Crear cuenta
              </Text>
            )}
          </TouchableOpacity>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity
              style={styles.linkBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.linkText}>
                ¿Ya tienes cuenta?{' '}
                <Text style={styles.linkHighlight}>
                  Entrar
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