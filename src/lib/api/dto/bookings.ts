// src/lib/api/dto/bookings.ts
export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export type BookingDto = {
  id: string;
  requestId: string;
  offerId: string;
  contractId?: string | null;
  providerUserId?: string | null;
  clientId?: string | null;
  startAt: string;
  durationMin: number;
  endAt: string;
  status: BookingStatus;
  cancelledAt: string | null;
  cancelledBy: 'client' | 'provider' | 'admin' | null;
  cancelReason: string | null;
  rescheduledFromId: string | null;
  rescheduledToId: string | null;
  rescheduledAt: string | null;
  rescheduleReason: string | null;
};
