import { useEffect } from 'react';
import {
  Stack,
  useRouter,
  useSegments,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAuthStore } from '../src/context/authStore';

function AuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoading = useAuthStore(
    (s) => s.isLoading,
  );

  const isAuthenticated = useAuthStore(
    (s) => s.isAuthenticated,
  );

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuth = segments[0] === '(auth)';

    const inResetPassword =
      inAuth &&
      segments[1] === 'reset-password';

    if (
      !isAuthenticated &&
      !inAuth &&
      !inResetPassword
    ) {
      router.replace('/(auth)/login');
      return;
    }

    if (
      isAuthenticated &&
      inAuth &&
      !inResetPassword
    ) {
      router.replace('/(tabs)');
    }
  }, [
    isAuthenticated,
    isLoading,
    segments,
    router,
  ]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#C9A227"
        />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const loadUser = useAuthStore(
    (s) => s.loadUser,
  );

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthGate>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#0B1C2C',
          },
        }}
      />
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0B1C2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
});