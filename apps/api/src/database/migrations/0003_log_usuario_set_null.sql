ALTER TABLE "log" DROP CONSTRAINT "log_usuarioId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "log" ADD CONSTRAINT "log_usuarioId_user_id_fk" FOREIGN KEY ("usuarioId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
