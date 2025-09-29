import { Test, TestingModule } from '@nestjs/testing';
import { CreatePaymentUseCase } from './create-payment.use-case';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { MercadoPagoService } from '../../infrastructure/http/mercado-pago.service';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { CreatePaymentDto } from '../dtos/create-payment.dto';

describe('CreatePaymentUseCase', () => {
  let useCase: CreatePaymentUseCase;
  let repository: jest.Mocked<IPaymentRepository>;
  let mercadoPagoService: jest.Mocked<MercadoPagoService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePaymentUseCase,
        {
          provide: 'IPaymentRepository',
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {
            createPayment: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreatePaymentUseCase>(CreatePaymentUseCase);
    repository = module.get('IPaymentRepository');
    mercadoPagoService = module.get(MercadoPagoService);
  });

  describe('execute', () => {
    it('should create a PIX payment successfully', async () => {
      const dto: CreatePaymentDto = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.50,
        paymentMethod: PaymentMethod.PIX,
      };

      const mockPayment = {
        id: 'test-id',
        ...dto,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create.mockResolvedValue(mockPayment);

      const result = await useCase.execute(dto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cpf: dto.cpf,
          description: dto.description,
          amount: dto.amount,
          paymentMethod: PaymentMethod.PIX,
          status: PaymentStatus.PENDING,
        }),
      );
      expect(mercadoPagoService.createPayment).not.toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    it('should create a credit card payment and integrate with Mercado Pago', async () => {
      const dto: CreatePaymentDto = {
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.50,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      };

      const mockPayment = {
        id: 'test-id',
        ...dto,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMercadoPagoResponse = {
        id: 'mp-payment-id',
        status: 'pending',
        init_point: 'https://checkout.mercadopago.com',
      };

      repository.create.mockResolvedValue(mockPayment);
      mercadoPagoService.createPayment.mockResolvedValue(mockMercadoPagoResponse);

      const result = await useCase.execute(dto);

      expect(repository.create).toHaveBeenCalled();
      expect(mercadoPagoService.createPayment).toHaveBeenCalledWith({
        paymentId: mockPayment.id,
        amount: dto.amount,
        description: dto.description,
        customerEmail: `${dto.cpf}@example.com`,
      });
      expect(repository.update).toHaveBeenCalledWith(mockPayment.id, {
        mercadoPagoPaymentId: mockMercadoPagoResponse.id,
      });
      expect(result).toEqual(mockPayment);
    });
  });
});