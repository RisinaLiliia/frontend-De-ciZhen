import { apiGet, apiPost } from '@/lib/api/http';
import type {
  ChatConversationDto,
  ChatConversationsResponseDto,
  ChatMessageDto,
  ChatMessagesResponseDto,
  CreateConversationDto,
  CreateMessageDto,
  GetConversationsDto,
  GetMessagesDto,
} from '@/lib/api/dto/chat';

function normalizeToSocketOrigin(raw: string): string | null {
  try {
    const url = new URL(raw);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.origin;
  } catch {
    return null;
  }
}

function sortMessagesAscending<T extends { createdAt: string }>(items: T[]) {
  return items
    .slice()
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
}

function normalizeConversationsResponse(
  response: ChatConversationsResponseDto | ChatConversationDto[],
): ChatConversationsResponseDto {
  if (Array.isArray(response)) {
    return { items: response };
  }
  return response;
}

function buildConversationsQuery(params: GetConversationsDto = {}) {
  const query = new URLSearchParams();
  if (params.role) query.set('role', params.role);
  if (params.state) query.set('state', params.state);
  if (params.search) query.set('search', params.search);
  if (params.limit != null) query.set('limit', String(params.limit));
  if (params.cursor) query.set('cursor', params.cursor);
  const suffix = query.toString();
  return suffix ? `?${suffix}` : '';
}

function buildMessagesQuery(params: GetMessagesDto = {}) {
  const query = new URLSearchParams();
  if (params.limit != null) query.set('limit', String(params.limit));
  if (params.cursor) query.set('cursor', params.cursor);
  const suffix = query.toString();
  return suffix ? `?${suffix}` : '';
}

export function getChatSocketUrl() {
  const explicitWsBase = process.env.NEXT_PUBLIC_PRESENCE_WS_BASE?.trim();
  if (explicitWsBase) {
    const wsOrigin = normalizeToSocketOrigin(explicitWsBase);
    if (wsOrigin) return `${wsOrigin}/chat`;
  }

  const publicApiBase = process.env.NEXT_PUBLIC_API_BASE?.trim();
  if (publicApiBase) {
    const wsOrigin = normalizeToSocketOrigin(publicApiBase);
    if (wsOrigin) return `${wsOrigin}/chat`;
  }

  if (typeof window !== 'undefined') {
    const isLocalDev =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalDev) {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${window.location.host}/chat`;
    }
  }

  return '';
}

export async function createConversation(payload: CreateConversationDto) {
  return apiPost<CreateConversationDto, ChatConversationDto>('/chat/conversations', payload);
}

export async function listConversations(params: GetConversationsDto = {}) {
  const response = await apiGet<ChatConversationsResponseDto | ChatConversationDto[]>(
    `/chat/conversations${buildConversationsQuery(params)}`,
  );
  return normalizeConversationsResponse(response);
}

export async function getConversation(conversationId: string) {
  return apiGet<ChatConversationDto>(`/chat/conversations/${conversationId}`);
}

export async function getMessages(conversationId: string, params: GetMessagesDto = {}) {
  const response = await apiGet<ChatMessagesResponseDto | ChatMessageDto[]>(
    `/chat/conversations/${conversationId}/messages${buildMessagesQuery(params)}`,
  );
  if (Array.isArray(response)) return { items: sortMessagesAscending(response) };
  return {
    ...response,
    items: sortMessagesAscending(response.items),
  };
}

export async function sendMessage(payload: CreateMessageDto) {
  return apiPost<Omit<CreateMessageDto, 'conversationId'>, ChatMessageDto>(
    `/chat/conversations/${payload.conversationId}/messages`,
    {
      text: payload.text,
      attachments: payload.attachments,
    },
  );
}

export async function markConversationRead(conversationId: string) {
  return apiPost<void, { ok: true }>(`/chat/conversations/${conversationId}/read`, undefined);
}
