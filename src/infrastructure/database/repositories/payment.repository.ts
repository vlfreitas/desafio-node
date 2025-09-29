import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { PaymentSchema } from '../entities/payment.schema';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(PaymentSchema)
    private readonly repository: Repository<PaymentSchema>,
  ) {}

  async create(payment: Payment): Promise<Payment> {
    const schema = this.repository.create(payment);
    const saved = await this.repository.save(schema);
    return this.toDomain(saved);
  }

  async update(id: string, payment: Partial<Payment>): Promise<Payment> {
    await this.repository.update(id, payment);
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`Payment with ID ${id} not found after update`);
    }
    return this.toDomain(updated);
  }

  async findById(id: string): Promise<Payment | null> {
    const schema = await this.repository.findOne({ where: { id } });
    return schema ? this.toDomain(schema) : null;
  }

  async findAll(filters?: { cpf?: string; paymentMethod?: PaymentMethod }): Promise<Payment[]> {
    const query = this.repository.createQueryBuilder('payment');

    if (filters?.cpf) {
      query.andWhere('payment.cpf = :cpf', { cpf: filters.cpf });
    }

    if (filters?.paymentMethod) {
      query.andWhere('payment.paymentMethod = :paymentMethod', { paymentMethod: filters.paymentMethod });
    }

    const schemas = await query.getMany();
    return schemas.map(schema => this.toDomain(schema));
  }

  private toDomain(schema: PaymentSchema): Payment {
    return new Payment({
      id: schema.id,
      cpf: schema.cpf,
      description: schema.description,
      amount: Number(schema.amount),
      paymentMethod: schema.paymentMethod,
      status: schema.status,
      mercadoPagoPaymentId: schema.mercadoPagoPaymentId,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    });
  }
}