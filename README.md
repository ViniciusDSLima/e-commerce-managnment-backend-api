# E-commerce Management Backend API

API RESTful para gerenciamento de pedidos e produtos desenvolvida com NestJS, seguindo **Clean Architecture**, princípios **SOLID** e **Clean Code**. O projeto implementa uma arquitetura em camadas bem definida, garantindo separação de responsabilidades e alta testabilidade.

## Credenciais Padrao

**Login padrao para testes:**
- **Username:** `admin`
- **Password:** `admin123`

**Importante:** Em producao, altere essas credenciais e implemente um sistema de usuarios adequado.

## Funcionalidades

### Produtos
- Criar produto
- Listar produtos
- Buscar produto por ID
- Editar produto
- Deletar produto

### Pedidos
- Criar pedido (com validacao de estoque)
- Listar pedidos
- Buscar pedido por ID
- Cancelar pedido (devolve produtos ao estoque)

### Funcionalidades Técnicas

#### Seguranca e Autenticacao
- Autenticacao JWT obrigatoria para todas as rotas (exceto login)
- Senhas hasheadas com bcrypt
- Validacao de dados de entrada com class-validator
- Validacao de UUID nos parametros de rota

#### Performance e Escalabilidade
- Cache em memoria para listagens (TTL: 5 minutos)
- Paginacao em todas as listagens (page, limit)
- Indexes otimizados no banco de dados
- Locks pessimistas para evitar race conditions no estoque

#### Confiabilidade
- Transacoes de banco de dados para operacoes criticas
- Exception Filter global para respostas padronizadas
- Health checks (/health, /health/ready, /health/live)
- Migrations do TypeORM para controle de versao do schema

#### Observabilidade
- OpenTelemetry integrado para tracing distribuido
- Logging estruturado com Winston
- TraceId em todas as requisicoes e logs
- Middleware de log de requisicoes HTTP

#### Qualidade de Codigo
- Testes unitarios com 100% de cobertura nos casos de uso
- Clean Architecture com separacao de camadas
- Principios SOLID aplicados
- Clean Code e DRY

#### Auditoria
- Rastreamento de criacao (createdBy, createdAt)
- Rastreamento de atualizacao (updatedBy, updatedAt)
- Interceptor de auditoria automatico

#### Documentacao
- Swagger/OpenAPI completo
- Documentacao de todos os endpoints
- Exemplos de requisicoes e respostas

## Tecnologias

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para TypeScript
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **Docker** - Containerização
- **Jest** - Testes unitários (100% cobertura)
- **OpenTelemetry** - Observabilidade e tracing
- **Winston** - Logging estruturado
- **Cache Manager** - Sistema de cache
- **TypeORM Migrations** - Controle de versão do schema

## Instalacao

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- PostgreSQL (ou usar Docker)

### Instalação Local

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd e-commerce-managnment-backend-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ecommerce_db
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
NODE_ENV=development
```

4. Certifique-se de que o PostgreSQL está rodando e crie o banco de dados:
```bash
createdb ecommerce_db
```

5. Execute as migrations:
```bash
npm run migration:run
```

   **IMPORTANTE:** As migrations DEVEM ser executadas antes do seed!

6. Popule o banco de dados com dados de teste (opcional):
```bash
npm run seed
```

   **Nota:** Se voce receber erro sobre colunas nao existentes, certifique-se de que executou as migrations primeiro.

Isso criará:
- 8 produtos de exemplo (eletrônicos, acessórios, componentes)
- 3 pedidos de exemplo (2 completos, 1 pendente)

7. Inicie a aplicação:
```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`

## Instalacao com Docker

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd e-commerce-managnment-backend-api
```

2. Execute com Docker Compose:
```bash
docker-compose up -d
```

Isso irá:
- Criar e iniciar o container do PostgreSQL
- Criar e iniciar o container da API
- Configurar automaticamente as conexões

A API estará disponível em `http://localhost:3000`

Para parar os containers:
```bash
docker-compose down
```

Para ver os logs:
```bash
docker-compose logs -f api
```

## Uso da API

### Autenticação

Primeiro, faça login para obter o token JWT:

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Credenciais padrão:**
- Username: `admin`
- Password: `admin123`

Resposta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Use o token nas requisições seguintes no header:
```
Authorization: Bearer <seu-token>
```

### Produtos

#### Listar Produtos (com paginação)
```bash
GET http://localhost:3000/products?page=1&limit=10
Authorization: Bearer <seu-token>
```

Resposta:
```json
{
  "data": [
    {
      "id": "...",
      "name": "Product 1",
      "category": "Electronics",
      "price": 100.00,
      "stockQuantity": 10,
      "createdBy": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

#### Criar Produto
```bash
POST http://localhost:3000/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Notebook Dell",
  "category": "Electronics",
  "description": "Notebook Dell Inspiron 15",
  "price": 2999.99,
  "stockQuantity": 10
}
```

#### Buscar Produto por ID
```bash
GET http://localhost:3000/products/{id}
Authorization: Bearer <token>
```

#### Atualizar Produto
```bash
PATCH http://localhost:3000/products/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 2799.99,
  "stockQuantity": 15
}
```

#### Deletar Produto
```bash
DELETE http://localhost:3000/products/{id}
Authorization: Bearer <token>
```

### Pedidos

#### Criar Pedido
```bash
POST http://localhost:3000/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "uuid-do-produto",
      "quantity": 2
    }
  ]
}
```

O sistema irá:
- Validar se os produtos existem
- Verificar se há estoque suficiente
- Calcular o total do pedido
- Atualizar o estoque automaticamente (dentro de uma transação)
- Marcar o pedido como "COMPLETED"

#### Listar Pedidos (com paginação)
```bash
GET http://localhost:3000/orders?page=1&limit=10
Authorization: Bearer <token>
```

#### Buscar Pedido por ID
```bash
GET http://localhost:3000/orders/{id}
Authorization: Bearer <token>
```

#### Cancelar Pedido
```bash
PATCH http://localhost:3000/orders/{id}/cancel
Authorization: Bearer <token>
```

Ao cancelar um pedido concluído, os produtos são devolvidos ao estoque.

## Documentacao Swagger

Após iniciar a aplicação, acesse a documentação interativa do Swagger em:

```
http://localhost:3000/api
```

Lá você poderá:
- Ver todos os endpoints disponíveis
- Testar as requisições diretamente
- Ver exemplos de requisições e respostas
- Autenticar e testar endpoints protegidos

## Testes

### Executar todos os testes
```bash
npm run test
```

### Executar testes em modo watch
```bash
npm run test:watch
```

### Executar testes com cobertura
```bash
npm run test:cov
```

### Cobertura de Testes

O projeto mantém **100% de cobertura** nos casos de uso (use cases), garantindo que todas as regras de negócio estão testadas.

## Estrutura do Projeto

```
src/
├── domain/                  # Camada de Domínio (Regras de Negócio)
│   ├── entities/            # Entidades de domínio (Product, Order, OrderItem)
│   └── repositories/        # Interfaces de repositórios
│
├── application/             # Camada de Aplicação (Casos de Uso)
│   └── use-cases/          # Casos de uso específicos
│       ├── products/       # Casos de uso de produtos
│       └── orders/         # Casos de uso de pedidos
│
├── infrastructure/          # Camada de Infraestrutura
│   ├── persistence/        # Implementação de persistência
│   │   ├── typeorm/       # Entidades TypeORM, Migrations, Seeds
│   │   └── repositories/  # Implementações concretas
│   └── observability/      # OpenTelemetry, Logging
│
├── presentation/           # Camada de Apresentação (API)
│   ├── controllers/        # Controllers REST
│   └── dto/                # Data Transfer Objects
│
├── auth/                   # Módulo de autenticação
├── products/               # Módulo de produtos (NestJS)
├── orders/                 # Módulo de pedidos (NestJS)
├── common/                 # Código compartilhado
│   ├── middleware/        # Middlewares
│   ├── filters/           # Exception filters
│   ├── interceptors/      # Interceptors (auditoria)
│   └── dto/               # DTOs compartilhados
├── app.module.ts          # Módulo principal
└── main.ts                # Arquivo de entrada
```

## Arquitetura

O projeto implementa **Clean Architecture** com separação clara de responsabilidades em camadas:

### Estrutura de Diretórios

```
src/
├── domain/                    # Camada de Domínio (Regras de Negócio)
│   ├── entities/              # Entidades de domínio (Product, Order, OrderItem)
│   └── repositories/          # Interfaces de repositórios (IProductRepository, IOrderRepository)
│
├── application/                # Camada de Aplicação (Casos de Uso)
│   └── use-cases/             # Casos de uso específicos (CreateProduct, CreateOrder, etc.)
│
├── infrastructure/              # Camada de Infraestrutura (Implementações)
│   ├── persistence/           # Implementação de persistência
│   │   ├── typeorm/          # Entidades TypeORM, Repositórios, Migrations
│   │   └── repositories/     # Implementações concretas dos repositórios
│   └── observability/         # OpenTelemetry, Logging
│
└── presentation/               # Camada de Apresentação (API)
    ├── controllers/           # Controllers REST
    └── dto/                   # Data Transfer Objects
```

### Princípios Aplicados

#### Clean Architecture
- **Independência de frameworks**: O domínio não depende de TypeORM, NestJS, etc.
- **Testabilidade**: Regras de negócio testáveis sem dependências externas
- **Independência de UI**: A lógica de negócio não conhece HTTP/REST
- **Independência de banco**: O domínio não conhece detalhes de implementação do banco

#### SOLID
- **Single Responsibility**: Cada classe tem uma única responsabilidade
- **Open/Closed**: Extensível sem modificar código existente
- **Liskov Substitution**: Interfaces bem definidas permitem substituição
- **Interface Segregation**: Interfaces específicas (IProductRepository, IOrderRepository)
- **Dependency Inversion**: Dependências injetadas via construtor, dependendo de abstrações

#### Clean Code
- Nomenclatura clara e expressiva
- Funções pequenas e focadas
- DRY (Don't Repeat Yourself)
- Comentários apenas quando necessário
- Testes unitários com 100% de cobertura nos casos de uso

## Seguranca

- Autenticação JWT obrigatória para todas as rotas (exceto login)
- Validação de dados de entrada com class-validator
- Senhas hasheadas com bcrypt
- CORS habilitado (configure conforme necessário em produção)

## Migrations e Seeds

### Migrations

O projeto usa migrations do TypeORM para controle de versão do schema do banco de dados.

#### Comandos Disponíveis

```bash
# Executar todas as migrations pendentes
npm run migration:run

# Reverter a última migration
npm run migration:revert

# Gerar nova migration baseada nas mudanças das entidades
npm run migration:generate src/infrastructure/persistence/typeorm/migrations/NomeDaMigration

# Criar migration vazia
npm run migration:create src/infrastructure/persistence/typeorm/migrations/NomeDaMigration
```

#### Primeira Execução

Na primeira vez, execute:
```bash
npm run migration:run
```

Isso criará todas as tabelas, indexes e constraints definidos nas migrations.

### Seeds (Dados de Teste)

Para popular o banco de dados com dados de exemplo:

```bash
npm run seed
```

**IMPORTANTE:** Execute as migrations primeiro (`npm run migration:run`) antes de executar o seed!

Isso criará:
- **8 produtos** de exemplo em diferentes categorias (Electronics, Accessories, Components)
- **3 pedidos** de exemplo (2 completos, 1 pendente)

Os dados incluem:
- Notebooks, smartphones, acessórios, componentes
- Pedidos com diferentes status para testes
- Estoque configurado para permitir testes de criação de pedidos

**Ordem correta:**
1. `npm run migration:run` - Criar tabelas
2. `npm run seed` - Popular com dados

**Erro comum:**
Se você receber `column "stock_quantity" does not exist`, significa que as migrations não foram executadas. Execute `npm run migration:run` primeiro.

## Variaveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| DB_HOST | Host do PostgreSQL | localhost |
| DB_PORT | Porta do PostgreSQL | 5432 |
| DB_USERNAME | Usuário do banco | postgres |
| DB_PASSWORD | Senha do banco | postgres |
| DB_DATABASE | Nome do banco | ecommerce_db |
| JWT_SECRET | Chave secreta para JWT | your-secret-key-change-in-production |
| PORT | Porta da aplicação | 3000 |
| NODE_ENV | Ambiente (development/production) | development |

## Troubleshooting

### Erro de conexão com banco de dados
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Certifique-se de que o banco de dados foi criado

### Erro ao executar testes
- Certifique-se de que todas as dependências foram instaladas: `npm install`
- Verifique se o Jest está configurado corretamente

### Erro ao usar Docker
- Verifique se o Docker e Docker Compose estão instalados
- Tente reconstruir as imagens: `docker-compose build --no-cache`

## Resumo das Funcionalidades

### Endpoints Disponíveis

#### Autenticação
- `POST /auth/login` - Login e obtenção de token JWT

#### Produtos
- `GET /products?page=1&limit=10` - Listar produtos (com paginação e cache)
- `GET /products/:id` - Buscar produto por ID (com cache)
- `POST /products` - Criar produto (com auditoria)
- `PATCH /products/:id` - Atualizar produto (com auditoria)
- `DELETE /products/:id` - Deletar produto

#### Pedidos
- `GET /orders?page=1&limit=10` - Listar pedidos (com paginação)
- `GET /orders/:id` - Buscar pedido por ID
- `POST /orders` - Criar pedido (com transação e validação de estoque)
- `PATCH /orders/:id/cancel` - Cancelar pedido (com auditoria)

#### Health Checks
- `GET /health` - Health check completo
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

### Respostas de Paginação

Todas as listagens retornam objetos de paginação:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### Campos de Auditoria

Produtos e Pedidos incluem campos de auditoria:

```json
{
  "id": "...",
  "name": "Product",
  "createdBy": "admin",
  "updatedBy": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Testes

### Executar Testes

```bash
# Todos os testes
npm run test

# Testes em modo watch
npm run test:watch

# Testes com cobertura
npm run test:cov

# Testes end-to-end
npm run test:e2e
```

### Cobertura

O projeto mantém **100% de cobertura** nos casos de uso (use cases), garantindo que todas as regras de negócio estão testadas.

## Licenca

MIT

## Autor

Desenvolvido como parte de um desafio técnico, implementando boas práticas de desenvolvimento, Clean Architecture, SOLID e Clean Code.

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.
