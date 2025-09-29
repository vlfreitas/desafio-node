import { Injectable, Inject } from '@nestjs/common';
import { Payment } from '../../domain/entities/payment.entity';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

@Injectable()
export class ListPaymentsUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(filters?: { cpf?: string; paymentMethod?: PaymentMethod }): Promise<Payment[]> {
    return await this.paymentRepository.findAll(filters);
  }
}