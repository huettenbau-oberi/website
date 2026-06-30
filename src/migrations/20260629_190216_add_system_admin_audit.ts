import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_audit_logs_status" AS ENUM('success', 'error', 'pending');
  CREATE TABLE "audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" varchar NOT NULL,
  	"status" "enum_audit_logs_status" DEFAULT 'success' NOT NULL,
  	"actor_id" integer,
  	"actor_email" varchar,
  	"detail" varchar,
  	"params" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "is_admin" boolean DEFAULT false;
  -- Bootstrap: every existing user already had full admin access before this change,
  -- so grant them the new admin flag. New users default to false and must be promoted
  -- by an existing admin. Without this, no one could access the system tools post-deploy.
  UPDATE "users" SET "is_admin" = true;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audit_logs_id" integer;
  ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_id");
  CREATE INDEX "audit_logs_updated_at_idx" ON "audit_logs" USING btree ("updated_at");
  CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "audit_logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "audit_logs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_audit_logs_fk";
  
  DROP INDEX "payload_locked_documents_rels_audit_logs_id_idx";
  ALTER TABLE "users" DROP COLUMN "is_admin";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audit_logs_id";
  DROP TYPE "public"."enum_audit_logs_status";`)
}
