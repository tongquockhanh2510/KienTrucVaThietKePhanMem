"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPaymentEventConsumers = startPaymentEventConsumers;
const rabbitmq_1 = require("../rabbitmq");
const bookingService_1 = require("./bookingService");
function isPaymentCompletedEvent(payload) {
    return (payload?.type === rabbitmq_1.EVENTS.PAYMENT_COMPLETED &&
        typeof payload.bookingId === "string" &&
        typeof payload.userId === "string" &&
        typeof payload.paymentId === "string");
}
function isBookingFailedEvent(payload) {
    return (payload?.type === rabbitmq_1.EVENTS.BOOKING_FAILED &&
        typeof payload.bookingId === "string" &&
        typeof payload.userId === "string" &&
        typeof payload.paymentId === "string");
}
function startPaymentEventConsumers() {
    (0, rabbitmq_1.subscribeEvent)(rabbitmq_1.EVENTS.PAYMENT_COMPLETED, async (payload) => {
        if (!isPaymentCompletedEvent(payload)) {
            console.warn("⚠️  Invalid PAYMENT_COMPLETED payload:", payload);
            return;
        }
        await (0, bookingService_1.markBookingAsConfirmed)(payload);
        console.log(`✅ Booking ${payload.bookingId} marked as CONFIRMED`);
    });
    (0, rabbitmq_1.subscribeEvent)(rabbitmq_1.EVENTS.BOOKING_FAILED, async (payload) => {
        if (!isBookingFailedEvent(payload)) {
            console.warn("⚠️  Invalid BOOKING_FAILED payload:", payload);
            return;
        }
        await (0, bookingService_1.markBookingAsFailed)(payload);
        console.log(`❌ Booking ${payload.bookingId} marked as FAILED`);
    });
}
//# sourceMappingURL=paymentEvents.js.map