import { Payment } from '../entities/payment.entity';
import { PaymentMethod } from '../enums/payment-method.enum';

export interface IPaymentRepository {
  create(payment: Payment): Promise<Payment>;
  update(id: string, payment: Partial<Payment>): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findAll(filters?: { cpf?: string; paymentMethod?: PaymentMethod }): Promise<Payment[]>;
}