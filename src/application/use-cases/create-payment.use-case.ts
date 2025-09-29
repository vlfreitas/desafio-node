import { Injectable, Inject } from '@nestjs/common';
import { Payment } from '../../domain/entities/payment.entity';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { MercadoPagoService } from '../../infrastructure/http/mercado-pago.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  async execute(dto: CreatePaymentDto): Promise<Payment> {
    const payment = new Payment({
      id: uuidv4(),
      cpf: dto.cpf,
      description: dto.description,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdPayment = await this.paymentRepository.create(payment);

    if (dto.paymentMethod === PaymentMethod.CREDIT_CARD) {
      try {
        const mercadoPagoResponse = await this.mercadoPagoService.createPayment({
          paymentId: createdPayment.id,
          amount: dto.amount,
          description: dto.description,
          customerEmail: `${dto.cpf}@example.com`,
        });

        await this.paymentRepository.update(createdPayment.id, {
          mercadoPagoPaymentId: mercadoPagoResponse.id,
        });
      } catch (error) {
        await this.paymentRepository.update(createdPayment.id, {
          status: PaymentStatus.FAIL,
        });
        throw error;
      }
    }

    return createdPayment;
  }
}