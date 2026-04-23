export type EventType =
  | 'USER_REGISTERED'
  | 'BOOKING_CREATED'
  | 'PAYMENT_COMPLETED'
  | 'BOOKING_FAILED';

export interface BookingCreatedEvent {
  type: 'BOOKING_CREATED';
  bookingId: string;
  userId: string;
  movieId?: string;
  seats: string[];
  totalPrice: number;
  createdAt?: string;
}

export interface PaymentCompletedEvent {
  type: 'PAYMENT_COMPLETED';
  bookingId: string;
  userId: string;
  paymentId: string;
  amount: number;
  transactionRef: string;
  paidAt: string;
}

export interface BookingFailedEvent {
  type: 'BOOKING_FAILED';
  bookingId: string;
  userId: string;
  paymentId: string;
  amount: number;
  reason: string;
  failedAt: string;
}
