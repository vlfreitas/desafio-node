import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './presentation/controllers/payment.controller';
import { WebhookController } from './presentation/controllers/webhook.controller';
import { PaymentSchema } from './infrastructure/database/entities/payment.schema';
import { PaymentRepository } from './infrastructure/database/repositories/payment.repository';
import { MercadoPagoService } from './infrastructure/http/mercado-pago.service';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { UpdatePaymentUseCase } from './application/use-cases/update-payment.use-case';
import { GetPaymentUseCase } from './application/use-cases/get-payment.use-case';
import { ListPaymentsUseCase } from './application/use-cases/list-payments.use-case';
import { getDatabaseConfig } from './infrastructure/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([PaymentSchema]),
  ],
  controllers: [
    PaymentController,
    WebhookController,
  ],
  providers: [
    {
      provide: 'IPaymentRepository',
      useClass: PaymentRepository,
    },
    MercadoPagoService,
    CreatePaymentUseCase,
    UpdatePaymentUseCase,
    GetPaymentUseCase,
    ListPaymentsUseCase,
  ],
})
export class AppModule {}
