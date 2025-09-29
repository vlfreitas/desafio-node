import { IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePaymentDto {
  @ApiProperty({ enum: PaymentStatus, description: 'Status do pagamento', required: false })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}