# 📂 Gerenciador de Projetos e Tarefas — Node.js

API REST para gerenciar **projetos** e **tarefas** com **Node.js + Express**, **MySQL** (ORM **Sequelize**), arquitetura em camadas (`controllers → services → repositories`), cache (Redis opcional), documentação Swagger e testes (unitários e E2E).

> **Objetivo do README**: explicar como **clonar** o repositório e **subir tudo com Docker** (API, MySQL, Redis e phpMyAdmin), além de listar variáveis de ambiente, rotas e comandos úteis.

---

## ✨ Funcionalidades
- CRUD de **Projetos**
- CRUD de **Tarefas**
- Integração externa (**GitHub**): `GET /projects/:id/github/:username` — busca os **5 repositórios públicos mais recentes** do usuário e vincula ao projeto
- Cache (in-memory ou **Redis**) com TTL de **10 minutos**
- Boas práticas de segurança e performance (middlewares e validação)
- Testes **unitários** e **E2E**

---

## 🧱 Stack / Ferramentas
- **Node.js 22** (imagem: `node:22-bookworm`)
- **Express**
- **Sequelize** + **MySQL 8.4**
- **Redis 7.2** (opcional para cache)
- **Swagger UI** (docs)
- **Jest** + **Supertest** (testes)
- **Docker** e **Docker Compose**

---

## 📁 Estrutura de Pastas (principal)

```
src
├── controllers
│   ├── projects.controller.ts
│   └── tasks.controller.ts
├── database
│   ├── config.js
│   ├── migrations
│   │   ├── 20250813-001-create-projects.js
│   │   └── 20250813-002-create-tasks.js
│   └── seeders
│       ├── 20250813-001-demo-projects.js
│       └── 20250813-001-demo-tasks.js
├── index.ts
├── middlewares
│   └── validate.ts
├── models
│   ├── index.ts
│   ├── project.ts
│   └── task.ts
├── repositories
│   ├── projects.repo.ts
│   └── tasks.repo.ts
├── routes
│   ├── projects.routes.ts
│   └── tasks.routes.ts
├── server.ts
├── services
│   ├── cache.service.ts
│   ├── github.service.ts
│   ├── projects.service.ts
│   └── tasks.service.ts
├── swagger.ts
└── validations
    ├── project.validation.ts
    └── task.validation.ts

tests
├── e2e
│   ├── health.e2e.spec.ts
│   ├── projects.e2e.spec.ts
│   └── tasks.e2e.spec.ts
├── helpers
│   └── db.ts
├── jest.globalSetup.ts
├── jest.globalTeardown.ts
├── jest.setup.ts
└── unit
    ├── controllers
    │   ├── projects.controller.test.ts
    │   └── tasks.controller.test.ts
    ├── models
    │   ├── index.test.ts
    │   ├── project.test.ts
    │   └── task.test.ts
    ├── repositories
    │   ├── projects.repo.test.ts
    │   └── tasks.repo.test.ts
    └── services
        ├── cache.service.test.ts
        ├── github.service.test.ts
        ├── projects.service.test.ts
        └── tasks.service.test.ts
```

---

## 🔑 Variáveis de Ambiente (`.env`) a partir de `.env.example`

Este projeto inclui um arquivo **`.env.example`** na raiz.
Basta **copiar e renomear** para **`.env`** e ajustar os valores conforme necessário:

```bash
cp .env.example .env
```

> **⚠️ Importante:** `GITHUB_TOKEN` é **obrigatório** para a rota de integração do GitHub. Sem ele, chamadas à API do GitHub irão falhar (401/403/429).

> **Dica:** Ajuste `UID`/`GID` para o seu usuário local (Linux/macOS):
> `id -u` → UID, `id -g` → GID.

### Principais variáveis (referência)
> O seu `.env.example` já traz chaves e valores padrão; abaixo uma referência das mais importantes:

```env
# App
NODE_ENV=development
PORT=3000

# MySQL
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secret
DB_NAME=projects_db

# (opcionais para testes/entrypoint)
DB_HOST_TEST=mysql
DB_PORT_TEST=3306
DB_NAME_TEST=projects_db_test

# Redis (opcional, mas já incluso no docker-compose)
REDIS_HOST=redis
REDIS_PORT=6379

# GitHub (obrigatório para rota de integração)
GITHUB_TOKEN=coloque_seu_token_aqui

# phpMyAdmin
PHPMYADMIN_PORT=8080

# UID/GID (para mapear seu usuário dentro do container e evitar permissões em volumes)
UID=1000
GID=1000
```

---

## 🧩 Clonar o repositório

Via **SSH** (recomendado se você já configurou chave SSH no GitHub):

```bash
git clone git@github.com:davidaugusto89/project-task-api-node.git
cd project-task-api-node
```

Ou via **HTTPS**:

```bash
git clone https://github.com/davidaugusto89/project-task-api-node.git
cd project-task-api-node
```

Crie o arquivo `.env` conforme seção anterior.

---

## 🐳 Subir com Docker / Docker Compose

> Pré-requisitos: **Docker** e **Docker Compose** instalados.

### 1) Build e subida dos serviços
```bash
docker compose up -d --build
```

Isso irá levantar:
- **api** (Node 22 – porta `${PORT}`)
- **mysql** (8.4 – porta `${DB_PORT}`)
- **redis** (7.2 – porta `${REDIS_PORT}`)
- **phpmyadmin** (porta `${PHPMYADMIN_PORT}` → http://localhost:${PHPMYADMIN_PORT}/)

A API expõe **`/${PORT}`** no host (ex.: http://localhost:3000).

### 2) Acompanhar logs
```bash
docker compose logs -f api
```

O **entrypoint** (`docker-entrypoint.sh`) faz automaticamente:
1. Espera o MySQL responder.
2. Garante a existência do banco de **testes** (`DB_NAME_TEST`).
3. Executa **migrations** (`sequelize-cli db:migrate`).
4. Executa **seeders** (somente se a tabela `projects` estiver vazia).

### 3) Parar/Remover serviços
```bash
docker compose down
# ou para limpar volumes/dados (cuidado!):
docker compose down -v
```

---

## 📚 Documentação (Swagger)

Quando a API estiver rodando, acesse (ajuste a rota caso você tenha configurado diferente no código):

```
http://localhost:3000/api-docs
```

---

## 📥 Importar no Insomnia ou Postman

### YAML — `docs/project-task-api-node.yaml`
- Pode ser importado diretamente no **Insomnia** ou **Postman**.
- **Insomnia:** `Application → Import/Export → Import Data → From File` e selecione o `.yaml`
  _(gera uma Collection com rotas e schemas)_.
- **Postman:** `Import → File` e selecione o `.yaml`
  _(gera uma Collection a partir da especificação OpenAPI)_.

### HAR — `docs/project-task-api-node.har`
- Também pode ser importado no **Insomnia** ou **Postman**.
- **Insomnia/Postman:** `Import → File` e selecione o `.har`
  _(carrega requisições reais de exemplo para reproduzir chamadas)_.


---

## 🔗 Endpoints Principais

### Projetos
- `POST /projects` — cria projeto
- `GET /projects` — lista projetos (considere paginação/filters se implementados)
- `GET /projects/:id` — detalhes de um projeto
- `PUT /projects/:id` — atualiza projeto
- `DELETE /projects/:id` — remove projeto

### Tarefas
- `POST /projects/:projectId/tasks` — cria tarefa vinculada a um projeto
- `PUT /tasks/:id` — atualiza status/título/descrição
- `DELETE /tasks/:id` — remove tarefa

### Integração GitHub
- `GET /projects/:id/github/:username` — busca no GitHub os **5 últimos repositórios** públicos do `:username`, **vincula ao projeto** e **salva no banco**.

> API usada: `https://api.github.com/users/{username}/repos`
> **GITHUB_TOKEN é obrigatório**: configure `GITHUB_TOKEN` no `.env` para autenticar contra a API do GitHub e evitar erros de autenticação/limite de requisições.
> Dica: gere um **Personal Access Token** (PAT) com permissões para ler repositórios públicos.

---

## 🧪 Testes

Rodar testes **dentro do container**:
```bash
docker compose exec api npm test
```

Ou (se preferir rodar localmente, com Node 22 e deps instaladas):
```bash
npm ci
npm test
```

Há testes **unitários** e **E2E** em `tests/`.

---

## 🛢️ Banco de Dados, Migrations e Seeders

As **migrations/seeders** são executadas automaticamente pelo entrypoint ao subir os serviços.

Para executar manualmente **dentro** do container:
```bash
docker compose exec api npx sequelize-cli db:migrate --config src/database/config.js
docker compose exec api npx sequelize-cli db:seed:all --config src/database/config.js
```

Para reverter:
```bash
docker compose exec api npx sequelize-cli db:migrate:undo:all --config src/database/config.js
```

---

## 🛡️ Segurança & Boas Práticas (resumo)
- **Validação** de payloads (`express-validator` — ver `middlewares/validate.ts` e `validations/`).
- **CORS**, **Helmet**, **Compression**, **Rate limiting**.
- **Logs** estruturados (`morgan`).
- **Camadas** bem definidas: `controllers → services → repositories → models`.

---

## 📌 Repositório

- GitHub (SSH): `git@github.com:davidaugusto89/project-task-api-node.git`
- GitHub (HTTPS): `https://github.com/davidaugusto89/project-task-api-node`


---

## 📜 Scripts NPM

> Os principais scripts definidos em `package.json`:

```bash
# Desenvolvimento / build / execução
npm run dev          # ts-node com nodemon (src/index.ts)
npm run build        # transpila TypeScript para dist/
npm start            # executa dist/index.js

# Banco de dados (sequelize-cli)
npm run db:migrate
npm run db:migrate:undo
npm run db:seed
npm run db:seed:undo

# Qualidade de código
npm run lint
npm run lint:fix
npm run format
npm run format:check

# Testes
npm run test:unit    # unitários
npm run test:e2e     # end-to-end
npm run coverage     # relatório de cobertura
```

### Como usar **dentro do container**
Como o serviço `api` já inicia com `npm run dev`, use os comandos abaixo para tarefas pontuais:
```bash
docker compose exec api npm run test:unit
docker compose exec api npm run test:e2e
docker compose exec api npm run coverage
docker compose exec api npm run db:migrate
docker compose exec api npm run db:seed
docker compose exec api npm run lint
docker compose exec api npm run format:check
```

> **Husky & lint-staged**: hooks de _pre-commit_ são habilitados via `npm ci`/`npm i` (script `prepare`). Se estiver trabalhando **fora do Docker**, rode `npm ci` para ativar os hooks localmente.


---

## 🧑 Autor

Desenvolvido por [David Augusto](https://github.com/davidaugusto89)

Licenciado sob a licença MIT.
