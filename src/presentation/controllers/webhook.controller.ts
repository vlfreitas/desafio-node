import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdatePaymentUseCase } from '../../application/use-cases/update-payment.use-case';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

@ApiTags('webhooks')
@Controller('api/payment/webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly updatePaymentUseCase: UpdatePaymentUseCase) {}

  @Post('mercado-pago')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook do Mercado Pago' })
  @ApiResponse({ status: 200, description: 'Webhook processado com sucesso' })
  async handleMercadoPagoWebhook(@Body() body: any): Promise<void> {
    this.logger.log('Recebido webhook do Mercado Pago', body);

    try {
      if (body.type === 'payment') {
        const externalReference = body.data?.external_reference;

        if (externalReference) {
          let status: PaymentStatus;

          switch (body.data.status) {
            case 'approved':
              status = PaymentStatus.PAID;
              break;
            case 'rejected':
            case 'cancelled':
              status = PaymentStatus.FAIL;
              break;
            default:
              status = PaymentStatus.PENDING;
          }

          await this.updatePaymentUseCase.execute(externalReference, { status });
          this.logger.log(`Pagamento ${externalReference} atualizado para status: ${status}`);
        }
      }
    } catch (error) {
      this.logger.error('Erro ao processar webhook do Mercado Pago', error);
    }
  }
}