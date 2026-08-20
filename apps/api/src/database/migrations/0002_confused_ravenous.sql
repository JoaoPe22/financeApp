CREATE TABLE "chat_mensagem" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"role" text NOT NULL,
	"conteudo" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_mensagem" ADD CONSTRAINT "chat_mensagem_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_mensagem_user_idx" ON "chat_mensagem" USING btree ("userId");