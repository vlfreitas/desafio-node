import { IsEnum, IsNotEmpty, IsNumber, IsString, Matches, Min } from 'class-validator';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'CPF do cliente', example: '12345678901' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 dígitos' })
  cpf: string;

  @ApiProperty({ description: 'Descrição da cobrança', example: 'Pagamento de produto' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Valor da transação', example: 100.50 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, description: 'Método de pagamento' })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}