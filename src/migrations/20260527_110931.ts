import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "banner" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_from" timestamp(3) with time zone,
  	"show_until" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "banner_locales" (
  	"text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "banner_locales" ADD CONSTRAINT "banner_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."banner"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "banner_locales_locale_parent_id_unique" ON "banner_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "banner" CASCADE;
  DROP TABLE "banner_locales" CASCADE;`)
}
