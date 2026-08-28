import { api } from './client';

export interface AchievementItem {
  id: string;
  code: string;
  name: string;
  description: string;
  iconUrl?: string | null;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string | null;
}

export async function getAchievements(): Promise<AchievementItem[]> {
  const { data } = await api.get<AchievementItem[]>('/achievements');
  return data;
}
