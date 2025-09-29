import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { UpdatePaymentUseCase } from '../../application/use-cases/update-payment.use-case';
import { GetPaymentUseCase } from '../../application/use-cases/get-payment.use-case';
import { ListPaymentsUseCase } from '../../application/use-cases/list-payments.use-case';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

describe('PaymentController', () => {
  let controller: PaymentController;
  let createPaymentUseCase: jest.Mocked<CreatePaymentUseCase>;
  let updatePaymentUseCase: jest.Mocked<UpdatePaymentUseCase>;
  let getPaymentUseCase: jest.Mocked<GetPaymentUseCase>;
  let listPaymentsUseCase: jest.Mocked<ListPaymentsUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: CreatePaymentUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdatePaymentUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetPaymentUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ListPaymentsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    createPaymentUseCase = module.get(CreatePaymentUseCase);
    updatePaymentUseCase = module.get(UpdatePaymentUseCase);
    getPaymentUseCase = module.get(GetPaymentUseCase);
    listPaymentsUseCase = module.get(ListPaymentsUseCase);
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const dto = {
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

      createPaymentUseCase.execute.mockResolvedValue(mockPayment);

      const result = await controller.createPayment(dto);

      expect(createPaymentUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        id: mockPayment.id,
        cpf: mockPayment.cpf,
        description: mockPayment.description,
        amount: mockPayment.amount,
        paymentMethod: mockPayment.paymentMethod,
        status: mockPayment.status,
        mercadoPagoPaymentId: mockPayment.mercadoPagoPaymentId,
        createdAt: mockPayment.createdAt,
        updatedAt: mockPayment.updatedAt,
      });
    });
  });

  describe('getPayment', () => {
    it('should get a payment by id', async () => {
      const paymentId = 'test-id';
      const mockPayment = {
        id: paymentId,
        cpf: '12345678901',
        description: 'Test payment',
        amount: 100.50,
        paymentMethod: PaymentMethod.PIX,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      getPaymentUseCase.execute.mockResolvedValue(mockPayment);

      const result = await controller.getPayment(paymentId);

      expect(getPaymentUseCase.execute).toHaveBeenCalledWith(paymentId);
      expect(result.id).toBe(paymentId);
    });
  });
});