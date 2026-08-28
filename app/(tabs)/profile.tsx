import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/context/authStore';
import { getMyStats } from '../../src/api/statistics';
import { getMySubscription } from '../../src/api/subscriptions';
import { uploadAvatar } from '../../src/api/users';
import { useThemeStore } from '../../src/context/themeStore';

export default function ProfileScreen() {
  const { user, logout, loadUser } = useAuthStore();
  const { colors } = useThemeStore();
  const [stats, setStats] = useState<any>(null);
  const [plan, setPlan] = useState('FREE');
  const [uploading, setUploading] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;

  useEffect(() => {
    getMyStats()
      .then(setStats)
      .catch(() => {});
    getMySubscription()
      .then((d) => setPlan(d.limits?.plan || d.subscription?.plan || 'FREE'))
      .catch(() => {});
  }, []);

  const name = user?.name || 'Usuario';
  const email = user?.email || '';
  const level = user?.level ?? stats?.level ?? 1;
  const xp = user?.xp ?? stats?.xp ?? 0;
  const xpNext = Math.max(level * 1000, 1000);
  const xpProgress = Math.min(1, xp / xpNext);
  const streak = stats?.dailyStreak ?? 0;
  const accuracy = stats?.accuracy ?? 0;
  const position = stats?.rankPosition ?? '—';
  const testsCompleted = stats?.testsCompleted ?? 0;
  const initial = (name || 'U').charAt(0).toUpperCase();
  const avatarUrl = user?.avatarUrl || null;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.replace('/(auth)/login');
    }
  };

  const handleChangePhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Necesitamos acceso a la galería para cambiar tu foto de perfil.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      const asset = result.assets[0];
      setUploading(true);

      const response = await uploadAvatar(
        asset.uri,
        asset.mimeType || 'image/jpeg',
      );

      // Actualizamos el usuario en el store
      if (loadUser) {
        await loadUser();
      }

      Alert.alert('Foto actualizada', 'Tu foto de perfil se ha guardado correctamente.');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'No se pudo subir la foto. Comprueba que el endpoint /users/me/avatar esté creado en el backend.';
      Alert.alert('Error', String(msg));
    } finally {
      setUploading(false);
    }
  };

  const menu = [
    {
      key: 'fav',
      label: 'Mis favoritos',
      icon: 'star' as const,
      color: '#FBBF24',
      onPress: () => router.push('/(tabs)/study'),
    },
    {
      key: 'fail',
      label: 'Mis falladas',
      icon: 'close-circle' as const,
      color: '#F87171',
      onPress: () => router.push('/(tabs)/study'),
    },
    {
      key: 'history',
      label: 'Historial de preguntas',
      icon: 'time' as const,
      color: '#60A5FA',
      onPress: () => router.push('/history' as any),
    },
    {
      key: 'achievements',
      label: 'Logros',
      icon: 'trophy' as const,
      color: colors.primary,
      value: '—',
      onPress: () => router.push('/achievements'),
    },
    {
      key: 'sub',
      label: 'Suscripción',
      icon: 'diamond' as const,
      color: '#A78BFA',
      value:
        plan === 'PREMIUM' || plan === 'Premium' ? 'Premium' : 'Free',
      onPress: () => router.push('/settings'),
    },
  ];

  const AvatarBlock = () => (
    <View style={styles.avatarBlock}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        {uploading ? (
          <ActivityIndicator color={colors.primaryText} size="large" />
        ) : avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.avatarText, { color: colors.primaryText }]}>
            {initial}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.changePhotoBtn,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: uploading ? 0.6 : 1,
          },
        ]}
        onPress={handleChangePhoto}
        activeOpacity={0.85}
        disabled={uploading}
      >
        <Ionicons name="camera-outline" size={16} color={colors.primary} />
        <Text style={[styles.changePhotoText, { color: colors.primary }]}>
          {uploading
            ? 'Subiendo...'
            : avatarUrl
              ? 'Cambiar foto'
              : 'Añadir foto'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const UserInfoBlock = () => (
    <View style={styles.userInfoBlock}>
      <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
      {email ? (
        <Text style={[styles.email, { color: colors.textMuted }]}>{email}</Text>
      ) : null}
      <Text style={[styles.level, { color: colors.textMuted }]}>
        Nivel {level}
      </Text>

      <View style={styles.xpWrap}>
        <View
          style={[
            styles.xpTrack,
            { backgroundColor: colors.surfaceElevated || colors.surface },
          ]}
        >
          <View
            style={[
              styles.xpFill,
              {
                width: `${xpProgress * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.xpText, { color: colors.textMuted }]}>
          {xp.toLocaleString('es-ES')} / {xpNext.toLocaleString('es-ES')} XP
        </Text>
      </View>
    </View>
  );

  const StatsRow = () => (
    <View style={styles.miniRow}>
      {[
        { icon: '🔥', value: `${streak} días`, label: 'Racha' },
        { icon: '#', value: String(position), label: 'Posición' },
        { icon: '◎', value: `${accuracy}%`, label: 'Precisión' },
        { icon: '📝', value: String(testsCompleted), label: 'Tests' },
      ].map((m) => (
        <View
          key={m.label}
          style={[
            styles.miniCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={styles.miniIcon}>{m.icon}</Text>
          <Text style={[styles.miniValue, { color: colors.text }]}>
            {m.value}
          </Text>
          <Text style={[styles.miniLabel, { color: colors.textMuted }]}>
            {m.label}
          </Text>
        </View>
      ))}
    </View>
  );

  const MenuBlock = () => (
    <View
      style={[
        styles.menu,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {menu.map((item, index) => (
        <TouchableOpacity
          key={item.key}
          style={[
            styles.menuRow,
            { borderBottomColor: colors.border },
            index === menu.length - 1 && styles.menuRowLast,
          ]}
          onPress={item.onPress}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.menuIcon,
              { backgroundColor: `${item.color}22` },
            ]}
          >
            <Ionicons name={item.icon} size={18} color={item.color} />
          </View>
          <Text style={[styles.menuLabel, { color: colors.text }]}>
            {item.label}
          </Text>
          {item.value ? (
            <Text style={[styles.menuValue, { color: colors.primary }]}>
              {item.value}
            </Text>
          ) : (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: isDesktop
            ? colors.backgroundAlt || colors.background
            : colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.shell,
          isDesktop && styles.shellDesktop,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.topBar, isDesktop && styles.topBarDesktop]}>
          <Text style={[styles.topTitle, { color: colors.text }]}>Perfil</Text>
          <View style={styles.topActions}>
            <TouchableOpacity
              style={[
                styles.iconBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iconBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            isDesktop && styles.contentDesktop,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {isDesktop ? (
            <View style={styles.desktopRow}>
              <View style={styles.desktopLeft}>
                <View
                  style={[
                    styles.leftCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <AvatarBlock />
                  <UserInfoBlock />
                </View>
              </View>

              <View style={styles.desktopRight}>
                <StatsRow />
                <MenuBlock />
                <TouchableOpacity
                  style={[styles.logoutBtn, { borderColor: colors.danger }]}
                  onPress={handleLogout}
                >
                  <Text style={[styles.logoutText, { color: colors.danger }]}>
                    Cerrar sesión
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <AvatarBlock />
              <UserInfoBlock />
              <StatsRow />
              <MenuBlock />
              <TouchableOpacity
                style={[styles.logoutBtn, { borderColor: colors.danger }]}
                onPress={handleLogout}
              >
                <Text style={[styles.logoutText, { color: colors.danger }]}>
                  Cerrar sesión
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
  },
  shellDesktop: {
    maxWidth: 1100,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    marginVertical: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  topBarDesktop: {
    paddingHorizontal: 28,
    paddingTop: 20,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  contentDesktop: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    alignItems: 'stretch',
  },
  desktopRow: {
    flexDirection: 'row',
    gap: 24,
    width: '100%',
  },
  desktopLeft: {
    width: 320,
  },
  desktopRight: {
    flex: 1,
  },
  leftCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  avatarBlock: {
    alignItems: 'center',
    marginTop: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
  },
  changePhotoBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '700',
  },
  userInfoBlock: {
    alignItems: 'center',
    marginTop: 14,
    width: '100%',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
  },
  email: {
    marginTop: 4,
    fontSize: 13,
  },
  level: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  xpWrap: {
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  xpTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 999,
  },
  xpText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  miniRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 18,
    flexWrap: 'wrap',
  },
  miniCard: {
    flex: 1,
    minWidth: 70,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  miniIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  miniValue: {
    fontWeight: '800',
    fontSize: 15,
  },
  miniLabel: {
    marginTop: 2,
    fontSize: 11,
  },
  menu: {
    width: '100%',
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  menuValue: {
    fontWeight: '700',
    fontSize: 13,
  },
  logoutBtn: {
    marginTop: 22,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'center',
  },
  logoutText: {
    fontWeight: '700',
    fontSize: 15,
  },
});