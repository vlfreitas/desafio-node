import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface CreatePaymentRequest {
  paymentId: string;
  amount: number;
  description: string;
  customerEmail: string;
}

export interface MercadoPagoResponse {
  id: string;
  status: string;
  init_point: string;
}

@Injectable()
export class MercadoPagoService {
  private readonly client: AxiosInstance;
  private readonly accessToken: string;

  constructor(private readonly configService: ConfigService) {
    this.accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN') || '';

    this.client = axios.create({
      baseURL: 'https://api.mercadopago.com',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createPayment(request: CreatePaymentRequest): Promise<MercadoPagoResponse> {
    const preferenceData = {
      items: [
        {
          title: request.description,
          quantity: 1,
          unit_price: request.amount,
        },
      ],
      payer: {
        email: request.customerEmail,
      },
      external_reference: request.paymentId,
      notification_url: `${this.configService.get('BASE_URL')}/api/payment/webhook/mercado-pago`,
      back_urls: {
        success: `${this.configService.get('BASE_URL')}/payment/success`,
        failure: `${this.configService.get('BASE_URL')}/payment/failure`,
        pending: `${this.configService.get('BASE_URL')}/payment/pending`,
      },
      auto_return: 'approved',
    };

    const response = await this.client.post('/checkout/preferences', preferenceData);

    return {
      id: response.data.id,
      status: response.data.status,
      init_point: response.data.init_point,
    };
  }
}