CREATE TABLE "objetivo_historico" (
	"id" uuid PRIMARY KEY NOT NULL,
	"objetivoId" uuid NOT NULL,
	"valorAtual" numeric(10, 2) NOT NULL,
	"variacao" numeric(10, 2) NOT NULL,
	"observacao" text,
	"data" date NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "objetivo_historico_valor_check" CHECK ("objetivo_historico"."valorAtual" >= 0)
);
--> statement-breakpoint
ALTER TABLE "objetivo_historico" ADD CONSTRAINT "objetivo_historico_objetivoId_objetivo_id_fk" FOREIGN KEY ("objetivoId") REFERENCES "public"."objetivo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "objetivo_historico_objetivo_idx" ON "objetivo_historico" USING btree ("objetivoId");