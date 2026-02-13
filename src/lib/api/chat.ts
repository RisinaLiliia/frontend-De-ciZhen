// src/lib/api/chat.ts
import { apiGet, apiPost } from '@/lib/api/http';
import type { ChatMessageDto, ChatThreadDto, CreateMessageDto, CreateThreadDto } from '@/lib/api/dto/chat';

export function createThread(payload: CreateThreadDto) {
  return apiPost<CreateThreadDto, ChatThreadDto>('/chat/threads', payload);
}

export function listInbox(role?: 'client' | 'provider' | 'all') {
  const q = role ? `?role=${encodeURIComponent(role)}` : '';
  return apiGet<ChatThreadDto[]>(`/chat/inbox${q}`);
}

export function listMessages(threadId: string, params?: { limit?: number; offset?: number }) {
  const q = new URLSearchParams();
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.offset) q.set('offset', String(params.offset));
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return apiGet<ChatMessageDto[]>(`/chat/threads/${threadId}/messages${suffix}`);
}

export function sendMessage(threadId: string, payload: CreateMessageDto) {
  return apiPost<CreateMessageDto, ChatMessageDto>(`/chat/threads/${threadId}/messages`, payload);
}

export function markThreadRead(threadId: string) {
  return apiPost<void, { ok: true }>(`/chat/threads/${threadId}/read`, undefined);
}
