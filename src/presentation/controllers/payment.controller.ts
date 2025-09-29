import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreatePaymentDto } from '../../application/dtos/create-payment.dto';
import { UpdatePaymentDto } from '../../application/dtos/update-payment.dto';
import { PaymentResponseDto } from '../../application/dtos/payment-response.dto';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { UpdatePaymentUseCase } from '../../application/use-cases/update-payment.use-case';
import { GetPaymentUseCase } from '../../application/use-cases/get-payment.use-case';
import { ListPaymentsUseCase } from '../../application/use-cases/list-payments.use-case';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

@ApiTags('payments')
@Controller('api/payment')
@UsePipes(new ValidationPipe({ transform: true }))
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly updatePaymentUseCase: UpdatePaymentUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase,
    private readonly listPaymentsUseCase: ListPaymentsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo pagamento' })
  @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso', type: PaymentResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createPayment(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const payment = await this.createPaymentUseCase.execute(createPaymentDto);
    return this.toResponseDto(payment);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento atualizado com sucesso', type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  async updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.updatePaymentUseCase.execute(id, updatePaymentDto);
    return this.toResponseDto(payment);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pagamento por ID' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado', type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  async getPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    const payment = await this.getPaymentUseCase.execute(id);
    return this.toResponseDto(payment);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pagamentos com filtros opcionais' })
  @ApiQuery({ name: 'cpf', required: false, description: 'Filtrar por CPF' })
  @ApiQuery({ name: 'paymentMethod', required: false, enum: PaymentMethod, description: 'Filtrar por método de pagamento' })
  @ApiResponse({ status: 200, description: 'Lista de pagamentos', type: [PaymentResponseDto] })
  async listPayments(
    @Query('cpf') cpf?: string,
    @Query('paymentMethod') paymentMethod?: PaymentMethod,
  ): Promise<PaymentResponseDto[]> {
    const filters = {};
    if (cpf) filters['cpf'] = cpf;
    if (paymentMethod) filters['paymentMethod'] = paymentMethod;

    const payments = await this.listPaymentsUseCase.execute(filters);
    return payments.map(payment => this.toResponseDto(payment));
  }

  private toResponseDto(payment: any): PaymentResponseDto {
    return {
      id: payment.id,
      cpf: payment.cpf,
      description: payment.description,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      mercadoPagoPaymentId: payment.mercadoPagoPaymentId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}