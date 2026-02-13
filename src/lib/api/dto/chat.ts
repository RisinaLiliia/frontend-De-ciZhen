// src/lib/api/dto/chat.ts
export type ChatThreadDto = {
  id: string;
  requestId: string;
  clientId: string;
  providerUserId: string;
  offerId?: string | null;
  contractId?: string | null;
  participants: string[];
  status: 'active' | 'archived' | 'blocked';
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadClientCount: number;
  unreadProviderCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessageDto = {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export type CreateThreadDto = {
  requestId: string;
  providerUserId: string;
  offerId?: string;
  contractId?: string;
};

export type CreateMessageDto = {
  text: string;
};
