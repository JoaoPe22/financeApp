CREATE TABLE "conta_bancaria" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"banco" text NOT NULL,
	"agencia" text NOT NULL,
	"conta" text,
	"apelido" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "despesa_mensal" ADD COLUMN "formaPagamento" text;--> statement-breakpoint
ALTER TABLE "despesa_mensal" ADD COLUMN "contaBancariaId" uuid;--> statement-breakpoint
ALTER TABLE "conta_bancaria" ADD CONSTRAINT "conta_bancaria_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conta_bancaria_user_idx" ON "conta_bancaria" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "despesa_mensal" ADD CONSTRAINT "despesa_mensal_contaBancariaId_conta_bancaria_id_fk" FOREIGN KEY ("contaBancariaId") REFERENCES "public"."conta_bancaria"("id") ON DELETE set null ON UPDATE no action;