export interface IPayment {
  id?: number;
  orderId: number;
  amount: number;
  method: 'CASH' | 'BANKING' | 'MOMO';
  status?: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionRef?: string;
  paidAt?: Date;
}

export interface IPaymentRequest {
  orderId: number;
  amount: number;
  method: 'CASH' | 'BANKING' | 'MOMO';
}

export interface IPaymentResponse {
  success: boolean;
  message: string;
  data?: IPayment | null;
  error?: string;
}

export interface INotification {
  id?: number;
  userId: number;
  orderId: number;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'SYSTEM';
  isRead?: number;
  createdAt?: Date;
}

export interface INotificationPayload {
  userId: number;
  orderId: number;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'SYSTEM';
}

export interface IOrder {
  id: number;
  userId: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: 'CASH' | 'BANKING' | 'MOMO';
  items: any[];
}

export interface IUser {
  id: number;
  username: string;
  email: string;
}
