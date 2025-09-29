import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Payment } from '../../domain/entities/payment.entity';
import type { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { UpdatePaymentDto } from '../dtos/update-payment.dto';

@Injectable()
export class UpdatePaymentUseCase {
  constructor(
    @Inject('IPaymentRepository')
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(id: string, dto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return await this.paymentRepository.update(id, {
      ...dto,
      updatedAt: new Date(),
    });
  }
}