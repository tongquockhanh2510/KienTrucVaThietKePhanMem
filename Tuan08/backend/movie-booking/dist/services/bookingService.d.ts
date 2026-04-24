import { IBooking } from "../models/Booking";
import { BookingFailedEvent, PaymentCompletedEvent } from "../types";
interface BookingItemInput {
    movieId: string;
    quantity: number;
    seatNumbers: string[];
}
interface CreateBookingInput {
    userId: string;
    userName?: string;
    items: BookingItemInput[];
}
export declare function createBooking(input: CreateBookingInput): Promise<IBooking>;
export declare function markBookingAsConfirmed(event: PaymentCompletedEvent): Promise<void>;
export declare function markBookingAsFailed(event: BookingFailedEvent): Promise<void>;
export declare function getBookings(userId?: string): Promise<IBooking[]>;
export declare function getBookingById(bookingId: string): Promise<IBooking | null>;
export {};
//# sourceMappingURL=bookingService.d.ts.map