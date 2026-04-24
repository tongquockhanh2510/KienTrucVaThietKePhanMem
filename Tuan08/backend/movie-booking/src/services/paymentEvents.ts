import { BookingFailedEvent, PaymentCompletedEvent } from "../types";
import { EVENTS, subscribeEvent } from "../rabbitmq";
import { markBookingAsConfirmed, markBookingAsFailed } from "./bookingService";

function isPaymentCompletedEvent(payload: any): payload is PaymentCompletedEvent {
  return (
    payload?.type === EVENTS.PAYMENT_COMPLETED &&
    typeof payload.bookingId === "string" &&
    typeof payload.userId === "string" &&
    typeof payload.paymentId === "string"
  );
}

function isBookingFailedEvent(payload: any): payload is BookingFailedEvent {
  return (
    payload?.type === EVENTS.BOOKING_FAILED &&
    typeof payload.bookingId === "string" &&
    typeof payload.userId === "string" &&
    typeof payload.paymentId === "string"
  );
}

export function startPaymentEventConsumers(): void {
  subscribeEvent(EVENTS.PAYMENT_COMPLETED, async (payload) => {
    if (!isPaymentCompletedEvent(payload)) {
      console.warn("⚠️  Invalid PAYMENT_COMPLETED payload:", payload);
      return;
    }

    await markBookingAsConfirmed(payload);
    console.log(`✅ Booking ${payload.bookingId} marked as CONFIRMED`);
  });

  subscribeEvent(EVENTS.BOOKING_FAILED, async (payload) => {
    if (!isBookingFailedEvent(payload)) {
      console.warn("⚠️  Invalid BOOKING_FAILED payload:", payload);
      return;
    }

    await markBookingAsFailed(payload);
    console.log(`❌ Booking ${payload.bookingId} marked as FAILED`);
  });
}
