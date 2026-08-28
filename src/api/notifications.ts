import { api } from './client';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export async function getNotifications(params?: {
  onlyUnread?: boolean;
  limit?: number;
}) {
  const { data } = await api.get<{
    items: Notification[];
    total: number;
    unreadCount: number;
  }>('/notifications', { params });
  return data;
}

export async function markAsRead(id: string) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
}

export async function markAllAsRead() {
  const { data } = await api.patch('/notifications/read-all');
  return data;
}
