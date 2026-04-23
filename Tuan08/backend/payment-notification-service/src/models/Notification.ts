import { InferSchemaType, Schema, model } from 'mongoose';

const notificationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    bookingId: { type: String, required: true, index: true },
    eventType: { type: String, required: true, index: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;
export const NotificationModel = model('Notification', notificationSchema);
