import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import IberianLynxIcon from '../IberianLynxIcon';
import { useThemeStore } from '../../context/themeStore';

type Props = {
  userName?: string | null;
};

export default function HomeHeader({ userName }: Props) {
  const { mode, toggleMode } = useThemeStore();

  const hour = new Date().getHours();

  let saludo = 'Buenas noches';

  if (hour >= 6 && hour < 12) {
    saludo = 'Buenos días';
  } else if (hour >= 12 && hour < 20) {
    saludo = 'Buenas tardes';
  }

  const fecha = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const nombre = userName?.split(' ')[0] || 'opositor';

  return (
    <LinearGradient
      colors={
        mode === 'day'
          ? ['#007A53', '#00966A', '#00A878']
          : ['#071626', '#0A2342', '#13395F']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.top}>

        {/* IZQUIERDA: LINCE + MARCA */}
        <View style={styles.left}>
          <IberianLynxIcon size={150} />

          <View style={styles.brandBox}>
            <Text style={styles.brand}>
              IBERIAN
            </Text>

            <Text style={styles.date}>
              {fecha}
            </Text>
          </View>
        </View>

        {/* DERECHA: ACCIONES */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={toggleMode}
            activeOpacity={0.8}
          >
            <Ionicons
              name={mode === 'night' ? 'sunny' : 'moon'}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="notifications"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* SALUDO */}
      <Text style={styles.hello}>
        {saludo}, {nombre}
      </Text>

      {/* SUBTÍTULO */}
      <Text style={styles.subtitle}>
        Continúa preparando tu oposición
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 56,
    paddingHorizontal: 22,
    paddingBottom: 36,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  brandBox: {
    marginLeft: 14,
  },

  brand: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },

  date: {
    marginTop: 3,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize',
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  hello: {
    marginTop: 28,
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
});