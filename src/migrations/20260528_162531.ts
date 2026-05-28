import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_camp_sponsors_goenner" CASCADE;
  DROP TABLE "_pages_v_blocks_camp_sponsors_goenner" CASCADE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_camp_sponsors_goenner" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"name" varchar,
  	"url" varchar
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
  
  ALTER TABLE "pages_blocks_camp_sponsors_goenner" ADD CONSTRAINT "pages_blocks_camp_sponsors_goenner_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_camp_sponsors_goenner" ADD CONSTRAINT "pages_blocks_camp_sponsors_goenner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_camp_sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_camp_sponsors_goenner" ADD CONSTRAINT "_pages_v_blocks_camp_sponsors_goenner_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_camp_sponsors_goenner" ADD CONSTRAINT "_pages_v_blocks_camp_sponsors_goenner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_camp_sponsors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_camp_sponsors_goenner_order_idx" ON "pages_blocks_camp_sponsors_goenner" USING btree ("_order");
  CREATE INDEX "pages_blocks_camp_sponsors_goenner_parent_id_idx" ON "pages_blocks_camp_sponsors_goenner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_camp_sponsors_goenner_locale_idx" ON "pages_blocks_camp_sponsors_goenner" USING btree ("_locale");
  CREATE INDEX "pages_blocks_camp_sponsors_goenner_image_idx" ON "pages_blocks_camp_sponsors_goenner" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_camp_sponsors_goenner_order_idx" ON "_pages_v_blocks_camp_sponsors_goenner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_camp_sponsors_goenner_parent_id_idx" ON "_pages_v_blocks_camp_sponsors_goenner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_camp_sponsors_goenner_locale_idx" ON "_pages_v_blocks_camp_sponsors_goenner" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_camp_sponsors_goenner_image_idx" ON "_pages_v_blocks_camp_sponsors_goenner" USING btree ("image_id");`)
}
