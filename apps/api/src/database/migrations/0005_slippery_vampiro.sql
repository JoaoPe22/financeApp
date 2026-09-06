CREATE TABLE "reserva_historico" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reservaId" uuid NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"variacao" numeric(10, 2) NOT NULL,
	"observacao" text,
	"data" date NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reserva_historico_valor_check" CHECK ("reserva_historico"."valor" >= 0)
);
--> statement-breakpoint
ALTER TABLE "reserva_historico" ADD CONSTRAINT "reserva_historico_reservaId_reserva_id_fk" FOREIGN KEY ("reservaId") REFERENCES "public"."reserva"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reserva_historico_reserva_idx" ON "reserva_historico" USING btree ("reservaId");