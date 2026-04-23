import { InferSchemaType, Schema, model } from 'mongoose';

const paymentSchema = new Schema(
  {
    bookingId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    movieId: { type: String },
    seats: { type: [String], required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    transactionRef: { type: String, index: true },
    failureReason: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

paymentSchema.index({ bookingId: 1, status: 1 });

export type PaymentDocument = InferSchemaType<typeof paymentSchema>;
export const PaymentModel = model('Payment', paymentSchema);
