import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_camp_sponsors_links_link_type" AS ENUM('reference', 'custom');
   CREATE TYPE "public"."enum_pages_blocks_camp_sponsors_links_link_appearance" AS ENUM('default', 'outline');
   CREATE TYPE "public"."enum__pages_v_blocks_camp_sponsors_links_link_type" AS ENUM('reference', 'custom');
   CREATE TYPE "public"."enum__pages_v_blocks_camp_sponsors_links_link_appearance" AS ENUM('default', 'outline');

   CREATE TABLE "pages_blocks_camp_sponsors_main_sponsors" (
   	"_order" integer NOT NULL,
   	"_parent_id" varchar NOT NULL,
   	"_locale" "_locales" NOT NULL,
   	"id" varchar PRIMARY KEY NOT NULL,
   	"image_id" integer,
   	"name" varchar,
   	"url" varchar
   );

   CREATE TABLE "pages_blocks_camp_sponsors_goenner" (
   	"_order" integer NOT NULL,
   	"_parent_id" varchar NOT NULL,
   	"_locale" "_locales" NOT NULL,
   	"id" varchar PRIMARY KEY NOT NULL,
   	"image_id" integer,
   	"name" varchar,
   	"url" varchar
   );

   CREATE TABLE "pages_blocks_camp_sponsors_links" (
   	"_order" integer NOT NULL,
   	"_parent_id" varchar NOT NULL,
   	"_locale" "_locales" NOT NULL,
   	"id" varchar PRIMARY KEY NOT NULL,
   	"link_type" "enum_pages_blocks_camp_sponsors_links_link_type" DEFAULT 'reference',
   	"link_new_tab" boolean,
   	"link_url" varchar,
   	"link_label" varchar,
   	"link_appearance" "enum_pages_blocks_camp_sponsors_links_link_appearance" DEFAULT 'default'
   );

   CREATE TABLE "_pages_v_blocks_camp_sponsors_main_sponsors" (
   	"_order" integer NOT NULL,
   	"_parent_id" integer NOT NULL,
   	"_locale" "_locales" NOT NULL,
   	"id" serial PRIMARY KEY NOT NULL,
   	"image_id" integer,
   	"name" varchar,
   	"url" varchar,
   	"_uuid" varchar
   );

   CREATE TABLE "_pages_v_blocks_camp_sponsors_goenner" (
   	"_order" integer NOT NULL,
   	"_parent_id" integer NOT NULL,
   	"_locale" "_locales" NOT NULL,
   	"id" serial PRIMARY KEY NOT NULL,
   	"image_id" integer,
   	"name" varchar,
   	"url" varchar,
   	"_uuid" varchar
   );

   CREATE TABLE "_pages_v_blocks_camp_sponsors_links" (
   	"_order" integer NOT NULL,
   	"_parent_id" integer NOT NULL,
   	"_locale" "_locales" NOT NULL,
   	"id" serial PRIMARY KEY NOT NULL,
   	"link_type" "enum__pages_v_blocks_camp_sponsors_links_link_type" DEFAULT 'reference',
   	"link_new_tab" boolean,
   	"link_url" varchar,
   	"link_label" varchar,
   	"link_appearance" "enum__pages_v_blocks_camp_sponsors_links_link_appearance" DEFAULT 'default',
   	"_uuid" varchar
   );

   ALTER TABLE "pages_blocks_camp_sponsors_sponsors" ADD COLUMN "url" varchar;
   ALTER TABLE "_pages_v_blocks_camp_sponsors_sponsors" ADD COLUMN "url" varchar;

   ALTER TABLE "pages_blocks_camp_sponsors_main_sponsors" ADD CONSTRAINT "pages_blocks_camp_sponsors_main_sponsors_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "pages_blocks_camp_sponsors_main_sponsors" ADD CONSTRAINT "pages_blocks_camp_sponsors_main_sponsors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_camp_sponsors"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "pages_blocks_camp_sponsors_goenner" ADD CONSTRAINT "pages_blocks_camp_sponsors_goenner_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "pages_blocks_camp_sponsors_goenner" ADD CONSTRAINT "pages_blocks_camp_sponsors_goenner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_camp_sponsors"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "pages_blocks_camp_sponsors_links" ADD CONSTRAINT "pages_blocks_camp_sponsors_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_camp_sponsors"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "_pages_v_blocks_camp_sponsors_main_sponsors" ADD CONSTRAINT "_pages_v_blocks_camp_sponsors_main_sponsors_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "_pages_v_blocks_camp_sponsors_main_sponsors" ADD CONSTRAINT "_pages_v_blocks_camp_sponsors_main_sponsors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_camp_sponsors"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "_pages_v_blocks_camp_sponsors_goenner" ADD CONSTRAINT "_pages_v_blocks_camp_sponsors_goenner_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
   ALTER TABLE "_pages_v_blocks_camp_sponsors_goenner" ADD CONSTRAINT "_pages_v_blocks_camp_sponsors_goenner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_camp_sponsors"("id") ON DELETE cascade ON UPDATE no action;
   ALTER TABLE "_pages_v_blocks_camp_sponsors_links" ADD CONSTRAINT "_pages_v_blocks_camp_sponsors_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_camp_sponsors"("id") ON DELETE cascade ON UPDATE no action;

   CREATE INDEX "pages_blocks_camp_sponsors_main_sponsors_order_idx" ON "pages_blocks_camp_sponsors_main_sponsors" USING btree ("_order");
   CREATE INDEX "pages_blocks_camp_sponsors_main_sponsors_parent_id_idx" ON "pages_blocks_camp_sponsors_main_sponsors" USING btree ("_parent_id");
   CREATE INDEX "pages_blocks_camp_sponsors_main_sponsors_locale_idx" ON "pages_blocks_camp_sponsors_main_sponsors" USING btree ("_locale");
   CREATE INDEX "pages_blocks_camp_sponsors_main_sponsors_image_idx" ON "pages_blocks_camp_sponsors_main_sponsors" USING btree ("image_id");
   CREATE INDEX "pages_blocks_camp_sponsors_goenner_order_idx" ON "pages_blocks_camp_sponsors_goenner" USING btree ("_order");
   CREATE INDEX "pages_blocks_camp_sponsors_goenner_parent_id_idx" ON "pages_blocks_camp_sponsors_goenner" USING btree ("_parent_id");
   CREATE INDEX "pages_blocks_camp_sponsors_goenner_locale_idx" ON "pages_blocks_camp_sponsors_goenner" USING btree ("_locale");
   CREATE INDEX "pages_blocks_camp_sponsors_goenner_image_idx" ON "pages_blocks_camp_sponsors_goenner" USING btree ("image_id");
   CREATE INDEX "pages_blocks_camp_sponsors_links_order_idx" ON "pages_blocks_camp_sponsors_links" USING btree ("_order");
   CREATE INDEX "pages_blocks_camp_sponsors_links_parent_id_idx" ON "pages_blocks_camp_sponsors_links" USING btree ("_parent_id");
   CREATE INDEX "pages_blocks_camp_sponsors_links_locale_idx" ON "pages_blocks_camp_sponsors_links" USING btree ("_locale");
   CREATE INDEX "_pages_v_blocks_camp_sponsors_main_sponsors_order_idx" ON "_pages_v_blocks_camp_sponsors_main_sponsors" USING btree ("_order");
   CREATE INDEX "_pages_v_blocks_camp_sponsors_main_sponsors_parent_id_idx" ON "_pages_v_blocks_camp_sponsors_main_sponsors" USING btree ("_parent_id");
   CREATE INDEX "_pages_v_blocks_camp_sponsors_main_sponsors_locale_idx" ON "_pages_v_blocks_camp_sponsors_main_sponsors" USING btree ("_locale");
   CREATE INDEX "_pages_v_blocks_camp_sponsors_main_sponsors_image_idx" ON "_pages_v_blocks_camp_sponsors_main_sponsors" USING btree ("image_id");
   CREATE INDEX "_pages_v_blocks_camp_sponsors_goenner_order_idx" ON "_pages_v_blocks_camp_sponsors_goenner" USING btree ("_order");
   CREATE INDEX "_pages_v_blocks_camp_sponsors_goenner_parent_id_idx" ON "_pages_v_blocks_camp_sponsors_goenner" USING btree ("_parent_id");
   CREATE INDEX "_pages_v_blocks_camp_sponsors_goenner_locale_idx" ON "_pages_v_blocks_camp_sponsors_goenner" USING btree ("_locale");
   CREATE INDEX "_pages_v_blocks_camp_sponsors_goenner_image_idx" ON "_pages_v_blocks_camp_sponsors_goenner" USING btree ("image_id");
   CREATE INDEX "_pages_v_blocks_camp_sponsors_links_order_idx" ON "_pages_v_blocks_camp_sponsors_links" USING btree ("_order");
   CREATE INDEX "_pages_v_blocks_camp_sponsors_links_parent_id_idx" ON "_pages_v_blocks_camp_sponsors_links" USING btree ("_parent_id");
   CREATE INDEX "_pages_v_blocks_camp_sponsors_links_locale_idx" ON "_pages_v_blocks_camp_sponsors_links" USING btree ("_locale");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_camp_sponsors_main_sponsors" DROP CONSTRAINT "pages_blocks_camp_sponsors_main_sponsors_image_id_media_id_fk";
   ALTER TABLE "pages_blocks_camp_sponsors_main_sponsors" DROP CONSTRAINT "pages_blocks_camp_sponsors_main_sponsors_parent_id_fk";
   ALTER TABLE "pages_blocks_camp_sponsors_goenner" DROP CONSTRAINT "pages_blocks_camp_sponsors_goenner_image_id_media_id_fk";
   ALTER TABLE "pages_blocks_camp_sponsors_goenner" DROP CONSTRAINT "pages_blocks_camp_sponsors_goenner_parent_id_fk";
   ALTER TABLE "pages_blocks_camp_sponsors_links" DROP CONSTRAINT "pages_blocks_camp_sponsors_links_parent_id_fk";
   ALTER TABLE "_pages_v_blocks_camp_sponsors_main_sponsors" DROP CONSTRAINT "_pages_v_blocks_camp_sponsors_main_sponsors_image_id_media_id_fk";
   ALTER TABLE "_pages_v_blocks_camp_sponsors_main_sponsors" DROP CONSTRAINT "_pages_v_blocks_camp_sponsors_main_sponsors_parent_id_fk";
   ALTER TABLE "_pages_v_blocks_camp_sponsors_goenner" DROP CONSTRAINT "_pages_v_blocks_camp_sponsors_goenner_image_id_media_id_fk";
   ALTER TABLE "_pages_v_blocks_camp_sponsors_goenner" DROP CONSTRAINT "_pages_v_blocks_camp_sponsors_goenner_parent_id_fk";
   ALTER TABLE "_pages_v_blocks_camp_sponsors_links" DROP CONSTRAINT "_pages_v_blocks_camp_sponsors_links_parent_id_fk";

   DROP TABLE "pages_blocks_camp_sponsors_main_sponsors" CASCADE;
   DROP TABLE "pages_blocks_camp_sponsors_goenner" CASCADE;
   DROP TABLE "pages_blocks_camp_sponsors_links" CASCADE;
   DROP TABLE "_pages_v_blocks_camp_sponsors_main_sponsors" CASCADE;
   DROP TABLE "_pages_v_blocks_camp_sponsors_goenner" CASCADE;
   DROP TABLE "_pages_v_blocks_camp_sponsors_links" CASCADE;

   ALTER TABLE "pages_blocks_camp_sponsors_sponsors" DROP COLUMN IF EXISTS "url";
   ALTER TABLE "_pages_v_blocks_camp_sponsors_sponsors" DROP COLUMN IF EXISTS "url";

   DROP TYPE "public"."enum_pages_blocks_camp_sponsors_links_link_type";
   DROP TYPE "public"."enum_pages_blocks_camp_sponsors_links_link_appearance";
   DROP TYPE "public"."enum__pages_v_blocks_camp_sponsors_links_link_type";
   DROP TYPE "public"."enum__pages_v_blocks_camp_sponsors_links_link_appearance";
  `)
}
