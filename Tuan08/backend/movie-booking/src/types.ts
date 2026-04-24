export interface Movie {
  id: string;
  title: string;
  description: string;
  showtime: string;
  price: number;
  availableSeats: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface BookingItem {
  movieId: string;
  movieTitle: string;
  quantity: number;
  price: number;
  seatNumbers: string[];
}

export interface Booking {
  _id?: string;
  userId: string;
  userName?: string;
  items: BookingItem[];
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingCreatedEvent {
  type: "BOOKING_CREATED";
  bookingId: string;
  userId: string;
  userName?: string;
  movieId?: string;
  seats: string[];
  totalPrice: number;
  createdAt: string;
}

export interface PaymentCompletedEvent {
  type: "PAYMENT_COMPLETED";
  bookingId: string;
  userId: string;
  paymentId: string;
  amount: number;
  transactionRef: string;
  paidAt: string;
}

export interface BookingFailedEvent {
  type: "BOOKING_FAILED";
  bookingId: string;
  userId: string;
  paymentId: string;
  amount: number;
  reason: string;
  failedAt: string;
}
