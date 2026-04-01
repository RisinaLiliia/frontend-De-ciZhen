export type ChatParticipantRole = 'customer' | 'provider';
export type ChatConversationState = 'active' | 'archived' | 'closed';
export type ChatRelatedEntityType = 'request' | 'offer' | 'order';
export type ChatMessageType = 'text' | 'attachment' | 'system';
export type ChatDeliveryStatus = 'sent' | 'delivered' | 'read';

export type ChatParticipantDto = {
  userId: string;
  role: ChatParticipantRole;
  name?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  isOnline?: boolean | null;
  lastSeenAt?: string | null;
};

export type ChatConversationCounterpartDto = {
  userId: string;
  role: ChatParticipantRole;
  displayName: string;
  avatarUrl?: string | null;
  isOnline?: boolean | null;
  lastSeenAt?: string | null;
};

export type ChatRelatedEntityDto = {
  type: ChatRelatedEntityType;
  id: string;
  requestId?: string | null;
  offerId?: string | null;
  orderId?: string | null;
  title?: string | null;
  subtitle?: string | null;
  status?: string | null;
  amount?: number | null;
  amountLabel?: string | null;
};

export type ChatConversationLastMessageDto = {
  messageId: string;
  text: string;
  createdAt: string;
  senderId: string;
};

export type ChatConversationDto = {
  id: string;
  participants: ChatParticipantDto[];
  relatedEntity: ChatRelatedEntityDto;
  lastMessage?: ChatConversationLastMessageDto | null;
  counterpart?: ChatConversationCounterpartDto | null;
  unreadCount: Record<string, number>;
  unread?: number;
  lastMessagePreview?: string | null;
  state: ChatConversationState;
  createdAt: string;
  updatedAt: string;
};

export type ChatConversationsResponseDto = {
  items: ChatConversationDto[];
  nextCursor?: string;
};

export type ChatMessageAttachmentDto = {
  url: string;
  name: string;
  size: number;
  mimeType: string;
};

export type ChatMessageDto = {
  id: string;
  conversationId: string;
  senderId: string;
  type: ChatMessageType;
  text?: string;
  attachments?: ChatMessageAttachmentDto[];
  deliveryStatus: ChatDeliveryStatus;
  createdAt: string;
  pending?: boolean;
};

export type ChatMessagesResponseDto = {
  items: ChatMessageDto[];
  nextCursor?: string;
};

export type ChatMessageReadEventDto = {
  conversationId: string;
  userId: string;
  readAt: string;
};

export type GetConversationsDto = {
  role?: ChatParticipantRole;
  state?: Extract<ChatConversationState, 'active' | 'archived'>;
  search?: string;
  limit?: number;
  cursor?: string;
};

export type GetMessagesDto = {
  limit?: number;
  cursor?: string;
};

export type CreateConversationDto = {
  relatedEntity: {
    type: ChatRelatedEntityType;
    id: string;
  };
  participantUserId: string;
  participantRole?: ChatParticipantRole;
  requestId?: string;
  providerUserId?: string;
  offerId?: string;
  orderId?: string;
  contractId?: string;
};

export type CreateMessageDto = {
  conversationId: string;
  text?: string;
  attachments?: ChatMessageAttachmentDto[];
};

export type LegacyChatThreadDto = {
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

export type LegacyChatMessageDto = {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export type LegacyCreateThreadDto = {
  requestId: string;
  providerUserId: string;
  offerId?: string;
  contractId?: string;
};
