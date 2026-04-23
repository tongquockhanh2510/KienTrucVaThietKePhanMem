import { env } from '../config/env';
import { subscribeEvent } from '../config/broker';
import { NotificationModel } from '../models/Notification';
import { PaymentCompletedEvent } from '../types/events';

const parsePaymentCompletedEvent = (message: string): PaymentCompletedEvent | null => {
  try {
    const payload = JSON.parse(message) as Partial<PaymentCompletedEvent>;

    if (
      !payload.bookingId ||
      !payload.userId ||
      !payload.paymentId ||
      typeof payload.amount !== 'number' ||
      !payload.transactionRef ||
      !payload.paidAt
    ) {
      return null;
    }

    return {
      type: 'PAYMENT_COMPLETED',
      bookingId: String(payload.bookingId),
      userId: String(payload.userId),
      paymentId: String(payload.paymentId),
      amount: payload.amount,
      transactionRef: String(payload.transactionRef),
      paidAt: String(payload.paidAt),
    };
  } catch {
    return null;
  }
};

export async function startNotificationConsumer(): Promise<void> {
  await subscribeEvent(env.eventPaymentCompleted, async (message) => {
    const event = parsePaymentCompletedEvent(message);

    if (!event) {
      console.warn('Invalid PAYMENT_COMPLETED event payload:', message);
      return;
    }

    const notificationText = `User ${event.userId} da dat ve #${event.bookingId} thanh cong`;

    await NotificationModel.create({
      userId: event.userId,
      bookingId: event.bookingId,
      eventType: event.type,
      message: notificationText,
    });

    console.log(`Booking #${event.bookingId} thanh cong!`);
    console.log(notificationText);
  });
}
