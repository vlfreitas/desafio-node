# Payment API

API REST para gerenciamento de pagamentos com integração ao Mercado Pago, desenvolvida seguindo os princípios da Clean Architecture.

## Tecnologias Utilizadas

- **Node.js** com **NestJS** - Framework para construção de aplicações scaláveis
- **PostgreSQL** - Banco de dados relacional
- **TypeORM** - ORM para TypeScript
- **Swagger** - Documentação automática da API
- **Jest** - Framework de testes
- **Docker** - Containerização

## Arquitetura

O projeto segue os princípios da **Clean Architecture**, organizando o código em camadas bem definidas:

```
src/
├── domain/              # Regras de negócio e entidades
│   ├── entities/
│   ├── enums/
│   └── repositories/
├── application/         # Casos de uso e DTOs
│   ├── dtos/
│   └── use-cases/
├── infrastructure/      # Implementações técnicas
│   ├── database/
│   ├── http/
│   └── config/
└── presentation/        # Controllers e interface HTTP
    └── controllers/
```

## Funcionalidades

### Endpoints da API

#### Payments
- `POST /api/payment` - Criar novo pagamento
- `PUT /api/payment/{id}` - Atualizar pagamento
- `GET /api/payment/{id}` - Buscar pagamento por ID
- `GET /api/payment` - Listar pagamentos (com filtros por CPF e método de pagamento)

#### Webhooks
- `POST /api/payment/webhook/mercado-pago` - Receber notificações do Mercado Pago

### Regras de Negócio

#### Pagamentos PIX
- Criados com status `PENDING`
- Não requerem integração externa na etapa inicial

#### Pagamentos Cartão de Crédito
- Integração obrigatória com API do Mercado Pago
- Utiliza API de Preferências do Checkout
- Status atualizado via webhook

### Modelo de Dados

```typescript
{
  id: string;                    // UUID único
  cpf: string;                   // CPF do cliente (11 dígitos)
  description: string;           // Descrição da cobrança
  amount: number;                // Valor da transação
  paymentMethod: 'PIX' | 'CREDIT_CARD';  // Método de pagamento
  status: 'PENDING' | 'PAID' | 'FAIL';   // Status do pagamento
  mercadoPagoPaymentId?: string; // ID do pagamento no Mercado Pago
  createdAt: Date;               // Data de criação
  updatedAt: Date;               // Data de atualização
}
```

## Configuração e Execução

### Pré-requisitos

- Node.js 18+
- PostgreSQL 15+
- npm

### 1. Configuração do Ambiente

```bash
# Clone o repositório
git clone <repository-url>
cd payment-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

### 2. Configuração do Banco de Dados

```bash
# Inicie o PostgreSQL via Docker
docker-compose up -d

# Ou configure manualmente no PostgreSQL
# CREATE DATABASE payment_db;
```

### 3. Configuração do Mercado Pago

1. Acesse o [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Crie uma aplicação
3. Obtenha o Access Token de teste
4. Configure no arquivo `.env`:

```env
MERCADO_PAGO_ACCESS_TOKEN=TEST-your-access-token
```

### 4. Execução

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A API estará disponível em `http://localhost:3000`

## Documentação

### Swagger UI
Acesse `http://localhost:3000/api/docs` para visualizar a documentação interativa.

### Exemplos de Uso

#### Criar Pagamento PIX

```bash
curl -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "description": "Pagamento de produto",
    "amount": 100.50,
    "paymentMethod": "PIX"
  }'
```

#### Criar Pagamento Cartão de Crédito

```bash
curl -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "description": "Pagamento de produto",
    "amount": 100.50,
    "paymentMethod": "CREDIT_CARD"
  }'
```

#### Buscar Pagamentos por CPF

```bash
curl "http://localhost:3000/api/payment?cpf=12345678901"
```

## Testes

```bash
# Testes unitários
npm run test

# Testes com coverage
npm run test:cov

# Testes e2e
npm run test:e2e
```

## Validações

A API implementa validações robustas para:

- **CPF**: Deve conter exatamente 11 dígitos
- **Amount**: Deve ser maior que 0
- **PaymentMethod**: Deve ser 'PIX' ou 'CREDIT_CARD'
- **Status**: Deve ser 'PENDING', 'PAID' ou 'FAIL'

## Integração Mercado Pago

### Fluxo do Pagamento Cartão de Crédito

1. API cria o pagamento com status `PENDING`
2. Chama API do Mercado Pago para criar preferência de checkout
3. Retorna URL de pagamento para o cliente
4. Mercado Pago processa o pagamento
5. Webhook atualiza o status do pagamento

### Configuração do Webhook

Configure a URL do webhook no Mercado Pago:
```
https://seu-dominio.com/api/payment/webhook/mercado-pago
```

## Estrutura do Projeto

### Domain Layer
- **Entities**: Representam as regras de negócio fundamentais
- **Repositories**: Interfaces para acesso a dados
- **Enums**: Definições de tipos e estados

### Application Layer
- **Use Cases**: Implementam os casos de uso do sistema
- **DTOs**: Objetos de transferência de dados
- **Interfaces**: Contratos para serviços externos

### Infrastructure Layer
- **Database**: Implementação do repositório com TypeORM
- **HTTP**: Serviços de integração externa (Mercado Pago)
- **Config**: Configurações de banco e ambiente

### Presentation Layer
- **Controllers**: Endpoints HTTP e validações

## Monitoramento e Logs

A aplicação utiliza o sistema de logs do NestJS para registrar:
- Criação de pagamentos
- Chamadas para Mercado Pago
- Recebimento de webhooks
- Erros e exceções

## Deployment

### Docker

```bash
# Build da imagem
docker build -t payment-api .

# Executar container
docker run -p 3000:3000 payment-api
```

### Variáveis de Ambiente de Produção

```env
NODE_ENV=production
DATABASE_HOST=your-db-host
DATABASE_PASSWORD=secure-password
MERCADO_PAGO_ACCESS_TOKEN=PROD-your-token
BASE_URL=https://your-domain.com
```
