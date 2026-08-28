import { create } from 'zustand';
import { Platform } from 'react-native';

export type AppMode = 'night' | 'day';

type Palette = {
  mode: AppMode;
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  primary: string;
  primaryText: string;
  text: string;
  textMuted: string;
  textSoft: string;
  danger: string;
  gradient: readonly [string, string, string];
};

const night: Palette = {
  mode: 'night',
  background: '#0B1C2C',
  backgroundAlt: '#060F1A',
  surface: '#13253A',
  surfaceElevated: '#1A334D',
  border: '#1E3A56',
  primary: '#C9A227',
  primaryText: '#0B1C2C',
  text: '#F5F7FA',
  textMuted: '#8B9BB4',
  textSoft: '#C5D0DB',
  danger: '#F87171',
  gradient: ['#071626', '#0A2342', '#13395F'],
};

const day: Palette = {
  mode: 'day',
  background: '#FFFFFF',
  backgroundAlt: '#F3F6F5',
  surface: '#FFFFFF',
  surfaceElevated: '#E8F2EE',
  border: '#D0E0D9',
  primary: '#007A53',
  primaryText: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#5B6B66',
  textSoft: '#3D4F49',
  danger: '#DC2626',
  gradient: ['#007A53', '#00966A', '#00A878'],
};

type ThemeState = {
  mode: AppMode;
  colors: Palette;
  toggleMode: () => void;
  setMode: (mode: AppMode) => void;
};

function loadInitial(): AppMode {
  if (
    Platform.OS === 'web' &&
    typeof localStorage !== 'undefined'
  ) {
    const saved =
      localStorage.getItem('iberian_mode');

    if (
      saved === 'day' ||
      saved === 'night'
    ) {
      return saved;
    }
  }

  return 'night';
}

export const useThemeStore =
  create<ThemeState>((set, get) => {
    const initial = loadInitial();

    return {
      mode: initial,
      colors:
        initial === 'day'
          ? day
          : night,

      setMode: (mode) => {
        if (
          Platform.OS === 'web' &&
          typeof localStorage !== 'undefined'
        ) {
          localStorage.setItem(
            'iberian_mode',
            mode,
          );
        }

        set({
          mode,
          colors:
            mode === 'day'
              ? day
              : night,
        });
      },

      toggleMode: () => {
        const next =
          get().mode === 'night'
            ? 'day'
            : 'night';

        get().setMode(next);
      },
    };
  });