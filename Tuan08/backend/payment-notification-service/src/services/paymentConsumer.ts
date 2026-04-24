import { env } from '../config/env';
import { publishEvent, subscribeEvent } from '../config/broker';
import { PaymentModel } from '../models/Payment';
import {
  BookingCreatedEvent,
  BookingFailedEvent,
  PaymentCompletedEvent,
} from '../types/events';

const randomPaymentResult = (): boolean => Math.random() < 0.8;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const sanitizeSeats = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item));
};

const parseBookingCreatedEvent = (message: string): BookingCreatedEvent | null => {
  try {
    const payload = JSON.parse(message) as Partial<BookingCreatedEvent>;

    if (!payload.bookingId || !payload.userId || typeof payload.totalPrice !== 'number') {
      return null;
    }

    return {
      type: 'BOOKING_CREATED',
      bookingId: String(payload.bookingId),
      userId: String(payload.userId),
      movieId: payload.movieId ? String(payload.movieId) : undefined,
      seats: sanitizeSeats(payload.seats),
      totalPrice: payload.totalPrice,
      createdAt: payload.createdAt,
    };
  } catch {
    return null;
  }
};

export async function startPaymentConsumer(): Promise<void> {
  await subscribeEvent(env.eventBookingCreated, async (message) => {
    const event = parseBookingCreatedEvent(message);

    if (!event) {
      console.warn('Invalid BOOKING_CREATED event payload:', message);
      return;
    }

    const existing = await PaymentModel.findOne({
      bookingId: event.bookingId,
      status: { $in: ['SUCCESS', 'FAILED'] },
    });

    if (existing) {
      console.log(`Booking ${event.bookingId} already processed. Ignored duplicate event.`);
      return;
    }

    const payment = await PaymentModel.create({
      bookingId: event.bookingId,
      userId: event.userId,
      movieId: event.movieId,
      seats: event.seats,
      amount: event.totalPrice,
      status: 'PENDING',
    });

    await wait(500 + Math.floor(Math.random() * 1500));

    const paymentSuccess = randomPaymentResult();
    const transactionRef = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    if (paymentSuccess) {
      payment.status = 'SUCCESS';
      payment.transactionRef = transactionRef;
      payment.processedAt = new Date();
      await payment.save();

      const successEvent: PaymentCompletedEvent = {
        type: 'PAYMENT_COMPLETED',
        bookingId: event.bookingId,
        userId: event.userId,
        paymentId: String(payment._id),
        amount: event.totalPrice,
        transactionRef,
        paidAt: new Date().toISOString(),
      };

      await publishEvent(env.eventPaymentCompleted, successEvent);

      console.log(
        `Payment success for booking ${event.bookingId}. Event published: ${env.eventPaymentCompleted}`
      );
      return;
    }

    payment.status = 'FAILED';
    payment.failureReason = 'Random payment simulation failed';
    payment.processedAt = new Date();
    await payment.save();

    const failedEvent: BookingFailedEvent = {
      type: 'BOOKING_FAILED',
      bookingId: event.bookingId,
      userId: event.userId,
      paymentId: String(payment._id),
      amount: event.totalPrice,
      reason: payment.failureReason,
      failedAt: new Date().toISOString(),
    };

    await publishEvent(env.eventBookingFailed, failedEvent);

    console.log(
      `Payment failed for booking ${event.bookingId}. Event published: ${env.eventBookingFailed}`
    );
  });
}
