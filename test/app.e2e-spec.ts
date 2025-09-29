import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Payment API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    await app.init();
  });

  it('/api/payment (POST) - should create PIX payment', () => {
    return request(app.getHttpServer())
      .post('/api/payment')
      .send({
        cpf: '12345678901',
        description: 'Test PIX payment',
        amount: 100.50,
        paymentMethod: 'PIX'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.status).toBe('PENDING');
        expect(res.body.paymentMethod).toBe('PIX');
      });
  });

  it('/api/payment (POST) - should reject invalid CPF', () => {
    return request(app.getHttpServer())
      .post('/api/payment')
      .send({
        cpf: '123',
        description: 'Test payment',
        amount: 100.50,
        paymentMethod: 'PIX'
      })
      .expect(400);
  });
});
