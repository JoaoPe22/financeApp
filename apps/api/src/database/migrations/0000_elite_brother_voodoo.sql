CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"impersonatedBy" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categoria" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"nome" text NOT NULL,
	"tipo" text NOT NULL,
	"cor" text NOT NULL,
	"icone" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categoria_user_nome_tipo_unique" UNIQUE("userId","nome","tipo")
);
--> statement-breakpoint
CREATE TABLE "despesa_fixa" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"categoriaId" uuid NOT NULL,
	"descricao" text NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"diaVencimento" smallint NOT NULL,
	"obrigatoria" boolean DEFAULT true NOT NULL,
	"ativa" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "despesa_fixa_valor_check" CHECK ("despesa_fixa"."valor" >= 0),
	CONSTRAINT "despesa_fixa_dia_vencimento_check" CHECK ("despesa_fixa"."diaVencimento" BETWEEN 1 AND 31)
);
--> statement-breakpoint
CREATE TABLE "despesa_mensal" (
	"id" uuid PRIMARY KEY NOT NULL,
	"planejamentoMensalId" uuid NOT NULL,
	"categoriaId" uuid NOT NULL,
	"despesaFixaId" uuid,
	"descricao" text NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"dataVencimento" date NOT NULL,
	"status" text DEFAULT 'PENDENTE' NOT NULL,
	"dataPagamento" date,
	"observacao" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "despesa_mensal_valor_check" CHECK ("despesa_mensal"."valor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "investimento" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"categoriaId" uuid NOT NULL,
	"instituicaoFinanceira" text NOT NULL,
	"descricao" text NOT NULL,
	"valorAplicado" numeric(10, 2) NOT NULL,
	"rentabilidade" numeric(8, 4) NOT NULL,
	"indexador" text NOT NULL,
	"liquidez" text NOT NULL,
	"dataAplicacao" date NOT NULL,
	"dataVencimento" date NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "investimento_valor_aplicado_check" CHECK ("investimento"."valorAplicado" >= 0)
);
--> statement-breakpoint
CREATE TABLE "log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"usuarioId" text,
	"entidade" text NOT NULL,
	"entidadeId" text NOT NULL,
	"descricao" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "objetivo" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"valorMeta" numeric(10, 2) NOT NULL,
	"valorAtual" numeric(10, 2) DEFAULT '0' NOT NULL,
	"prazo" date NOT NULL,
	"status" text DEFAULT 'ATIVO' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "objetivo_valores_check" CHECK ("objetivo"."valorMeta" >= 0 AND "objetivo"."valorAtual" >= 0)
);
--> statement-breakpoint
CREATE TABLE "parcelamento" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"categoriaId" uuid NOT NULL,
	"descricao" text NOT NULL,
	"valorTotal" numeric(10, 2) NOT NULL,
	"valorEntrada" numeric(10, 2),
	"quantidadeParcelas" integer NOT NULL,
	"dataPrimeiraParcela" date NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parcelamento_quantidade_parcelas_check" CHECK ("parcelamento"."quantidadeParcelas" > 0),
	CONSTRAINT "parcelamento_valores_check" CHECK ("parcelamento"."valorTotal" >= 0 AND ("parcelamento"."valorEntrada" IS NULL OR "parcelamento"."valorEntrada" >= 0))
);
--> statement-breakpoint
CREATE TABLE "parcela" (
	"id" uuid PRIMARY KEY NOT NULL,
	"parcelamentoId" uuid NOT NULL,
	"planejamentoMensalId" uuid NOT NULL,
	"numero" integer NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'PENDENTE' NOT NULL,
	"dataVencimento" date NOT NULL,
	"dataPagamento" date,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parcela_parcelamento_numero_unique" UNIQUE("parcelamentoId","numero"),
	CONSTRAINT "parcela_numero_check" CHECK ("parcela"."numero" > 0),
	CONSTRAINT "parcela_valor_check" CHECK ("parcela"."valor" >= 0)
);
--> statement-breakpoint
CREATE TABLE "perfil" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"dataNascimento" date NOT NULL,
	"cep" text NOT NULL,
	"estado" text NOT NULL,
	"cidade" text NOT NULL,
	"bairro" text NOT NULL,
	"logradouro" text NOT NULL,
	"numero" text NOT NULL,
	"complemento" text,
	"tipoRenda" text NOT NULL,
	"salarioFixo" numeric(10, 2),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "perfil_userId_unique" UNIQUE("userId"),
	CONSTRAINT "perfil_salario_fixo_check" CHECK ("perfil"."salarioFixo" IS NULL OR "perfil"."salarioFixo" >= 0)
);
--> statement-breakpoint
CREATE TABLE "planejamento_mensal" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"mes" smallint NOT NULL,
	"ano" smallint NOT NULL,
	"salarioPrevisto" numeric(10, 2),
	"salarioRecebido" numeric(10, 2),
	"status" text DEFAULT 'ABERTO' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "planejamento_mensal_user_mes_ano_unique" UNIQUE("userId","mes","ano"),
	CONSTRAINT "planejamento_mensal_mes_check" CHECK ("planejamento_mensal"."mes" BETWEEN 1 AND 12)
);
--> statement-breakpoint
CREATE TABLE "receita" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"categoriaId" uuid NOT NULL,
	"planejamentoMensalId" uuid NOT NULL,
	"descricao" text NOT NULL,
	"valorBruto" numeric(10, 2),
	"valorLiquido" numeric(10, 2) NOT NULL,
	"dataRecebimento" date NOT NULL,
	"observacao" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "receita_valores_check" CHECK ("receita"."valorLiquido" >= 0 AND ("receita"."valorBruto" IS NULL OR "receita"."valorBruto" >= 0))
);
--> statement-breakpoint
CREATE TABLE "recomendacao" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tipo" text NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text NOT NULL,
	"lida" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reserva" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"planejamentoMensalId" uuid,
	"instituicao" text NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"rentabilidade" numeric(8, 4) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reserva_valor_check" CHECK ("reserva"."valor" >= 0)
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categoria" ADD CONSTRAINT "categoria_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "despesa_fixa" ADD CONSTRAINT "despesa_fixa_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "despesa_fixa" ADD CONSTRAINT "despesa_fixa_categoriaId_categoria_id_fk" FOREIGN KEY ("categoriaId") REFERENCES "public"."categoria"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "despesa_mensal" ADD CONSTRAINT "despesa_mensal_planejamentoMensalId_planejamento_mensal_id_fk" FOREIGN KEY ("planejamentoMensalId") REFERENCES "public"."planejamento_mensal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "despesa_mensal" ADD CONSTRAINT "despesa_mensal_categoriaId_categoria_id_fk" FOREIGN KEY ("categoriaId") REFERENCES "public"."categoria"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "despesa_mensal" ADD CONSTRAINT "despesa_mensal_despesaFixaId_despesa_fixa_id_fk" FOREIGN KEY ("despesaFixaId") REFERENCES "public"."despesa_fixa"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investimento" ADD CONSTRAINT "investimento_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investimento" ADD CONSTRAINT "investimento_categoriaId_categoria_id_fk" FOREIGN KEY ("categoriaId") REFERENCES "public"."categoria"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log" ADD CONSTRAINT "log_usuarioId_user_id_fk" FOREIGN KEY ("usuarioId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objetivo" ADD CONSTRAINT "objetivo_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcelamento" ADD CONSTRAINT "parcelamento_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcelamento" ADD CONSTRAINT "parcelamento_categoriaId_categoria_id_fk" FOREIGN KEY ("categoriaId") REFERENCES "public"."categoria"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcela" ADD CONSTRAINT "parcela_parcelamentoId_parcelamento_id_fk" FOREIGN KEY ("parcelamentoId") REFERENCES "public"."parcelamento"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcela" ADD CONSTRAINT "parcela_planejamentoMensalId_planejamento_mensal_id_fk" FOREIGN KEY ("planejamentoMensalId") REFERENCES "public"."planejamento_mensal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perfil" ADD CONSTRAINT "perfil_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planejamento_mensal" ADD CONSTRAINT "planejamento_mensal_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receita" ADD CONSTRAINT "receita_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receita" ADD CONSTRAINT "receita_categoriaId_categoria_id_fk" FOREIGN KEY ("categoriaId") REFERENCES "public"."categoria"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receita" ADD CONSTRAINT "receita_planejamentoMensalId_planejamento_mensal_id_fk" FOREIGN KEY ("planejamentoMensalId") REFERENCES "public"."planejamento_mensal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recomendacao" ADD CONSTRAINT "recomendacao_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_planejamentoMensalId_planejamento_mensal_id_fk" FOREIGN KEY ("planejamentoMensalId") REFERENCES "public"."planejamento_mensal"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "despesa_fixa_user_idx" ON "despesa_fixa" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "despesa_mensal_planejamento_idx" ON "despesa_mensal" USING btree ("planejamentoMensalId");--> statement-breakpoint
CREATE INDEX "investimento_user_idx" ON "investimento" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "objetivo_user_idx" ON "objetivo" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "parcelamento_user_idx" ON "parcelamento" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "parcela_planejamento_mensal_idx" ON "parcela" USING btree ("planejamentoMensalId");--> statement-breakpoint
CREATE INDEX "receita_user_idx" ON "receita" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "receita_planejamento_mensal_idx" ON "receita" USING btree ("planejamentoMensalId");--> statement-breakpoint
CREATE INDEX "recomendacao_user_idx" ON "recomendacao" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "reserva_user_idx" ON "reserva" USING btree ("userId");