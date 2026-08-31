<p align="center">
  <img src="apps/web/public/logotipo.png" alt="FinanceApp" width="380">
</p>

Aplicação de controle financeiro pessoal: organize despesas fixas e mensais, receitas, parcelamentos, investimentos, objetivos e reservas, acompanhe tudo num dashboard, gere relatórios em PDF/CSV e converse com um assistente financeiro por IA sobre suas próprias finanças.

Projeto de portfólio, aberto para a comunidade estudar, usar e contribuir.

## Funcionalidades

- **Dashboard** com evolução de saldo, gastos por categoria, parcelamentos em andamento e avisos automáticos (insights) sobre a saúde financeira do mês.
- **Planejamento mensal**: despesas fixas, despesas avulsas, receitas e parcelas do mês, com controle de pago/pendente.
- **Parcelamentos, investimentos, objetivos e reservas** com formulários dedicados.
- **Relatórios** exportáveis em PDF e CSV.
- **Chat financeiro com IA** (Google Gemini): tira dúvidas sobre o impacto de decisões financeiras usando os dados reais do usuário. Recurso opcional — o app funciona normalmente sem configurar isso.
- **Autenticação completa**: cadastro com verificação de e-mail obrigatória, login, recuperação de senha, exclusão de conta (com todos os dados 

## Tecnologias

**Backend** (`apps/api`) — Fastify 5 · TypeScript · Drizzle ORM · PostgreSQL · better-auth · Zod · Google Gemini AI SDK

**Frontend** (`apps/web`) — Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · shadcn/ui (Radix) · TanStack Query · React Hook Form + Zod · Recharts · @react-pdf/renderer

Monorepo gerenciado com **pnpm workspaces**.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20.9 ou superior
- [pnpm](https://pnpm.io/) 10 ou superior (`corepack enable` já resolve, o `packageManager` do projeto fixa a versão)
- Um banco **PostgreSQL** rodando (local, Docker, ou um serviço gerenciado)

## Como rodar localmente

### 1. Clone e instale as dependências

```bash
git clone https://github.com/JoaoPe22/projeto.git financeapp
cd financeapp
pnpm install
```

### 2. Suba um banco PostgreSQL

Se não tiver um Postgres rodando, a forma mais rápida é via Docker:

```bash
docker run --name financeapp-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=finance_app -p 5432:5432 -d postgres:16
```

### 3. Configure as variáveis de ambiente

Copie os dois arquivos de exemplo:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Depois, edite os dois `.env` seguindo o guia abaixo.

> ⚠️ **`DATABASE_URL` e `BETTER_AUTH_SECRET` precisam ser exatamente iguais nos dois arquivos** (`apps/api/.env` e `apps/web/.env`). A aplicação usa duas instâncias do better-auth — uma em cada app — que compartilham o mesmo banco e o mesmo segredo para que uma sessão criada no front-end seja validada pela API.

Gere um segredo forte para `BETTER_AUTH_SECRET` em `https://better-auth.com/docs/installation`. Procure por `Generate Secret` e coloque o código gerado no arquivo `.env` referente.


#### `apps/api/.env`

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do Postgres, ex.: `postgres://postgres:postgres@localhost:5432/finance_app` |
| `BETTER_AUTH_SECRET` | Segredo gerado no passo acima (igual ao do `apps/web/.env`) |
| `BETTER_AUTH_URL` | URL da API, ex.: `http://localhost:3333` |
| `FRONTEND_URL` | URL do front-end, ex.: `http://localhost:3000` (usada no CORS) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Credenciais SMTP para envio de e-mail (confirmação de cadastro, redefinição de senha). Com Gmail, use uma [senha de app](https://myaccount.google.com/apppasswords), não a senha normal da conta |
| `SMTP_FROM_NAME` / `SMTP_FROM_EMAIL` | Nome/e-mail exibidos como remetente |
| `APPLICATION_TIMEZONE` | Fuso horário usado nos cálculos de data, ex.: `America/Sao_Paulo` |
| `GEMINI_API_KEY` | **Opcional.** Chave da [Google AI Studio](https://aistudio.google.com/apikey) para habilitar o chat financeiro. Sem ela, o chat retorna um erro amigável — o resto do app funciona normalmente |

#### `apps/web/.env`

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Igual ao do `apps/api/.env` |
| `BETTER_AUTH_SECRET` | Igual ao do `apps/api/.env` |
| `BETTER_AUTH_URL` | URL do front-end, ex.: `http://localhost:3000` |
| `SMTP_*` | Mesmas credenciais SMTP do `apps/api/.env` |
| `NEXT_PUBLIC_BETTER_AUTH_BASE_URL` | Mesma URL do `BETTER_AUTH_URL` acima |
| `NEXT_PUBLIC_API_URL` | URL da API, ex.: `http://localhost:3333` |
| `NEXT_PUBLIC_APPLICATION_TIMEZONE` | Mesmo fuso horário do `apps/api/.env` |
| `NEXT_PUBLIC_GEO_API_URL` | API pública usada para autocompletar estado/cidade a partir do CEP |

### 4. Rode as migrations do banco

```bash
cd apps/api
pnpm db:migrate
cd ../..
```

### 5. Suba os dois servidores

Em dois terminais separados:

```bash
pnpm --filter @financeApp/api dev    # API em http://localhost:3333
pnpm --filter @financeApp/web dev    # Web em http://localhost:3000
```

Acesse [http://localhost:3000](http://localhost:3000), crie uma conta e confirme o e-mail (verifique o console da API se o SMTP não estiver configurado — a confirmação também é registrada por lá).

## Scripts úteis

Rodar dentro de `apps/api` ou `apps/web`:

| Comando | O que faz |
|---|---|
| `pnpm dev` | Sobe o servidor em modo desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm lint` / `pnpm lint:fix` | Lint (ESLint) |
| `pnpm format` | Formata o código (Prettier) |

Só em `apps/api`:

| Comando | O que faz |
|---|---|
| `pnpm db:generate` | Gera uma nova migration a partir do schema Drizzle |
| `pnpm db:migrate` | Aplica as migrations pendentes |
| `pnpm db:studio` | Abre o Drizzle Studio para inspecionar o banco |

## Estrutura do projeto

```
.
├── apps/
│   ├── api/    # Fastify — rotas HTTP, banco de dados, integrações (e-mail, IA)
│   └── web/    # Next.js — interface, autenticação client-side, chamadas à API
└── pnpm-workspace.yaml
```

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

## Autor

João Pedro Canezin — [joao.canezin22@gmail.com](mailto:joao.canezin22@gmail.com)
