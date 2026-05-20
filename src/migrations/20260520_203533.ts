import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_gallery_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gallery_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_gallery_timeline" ADD CONSTRAINT "pages_blocks_gallery_timeline_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_gallery_timeline" ADD CONSTRAINT "pages_blocks_gallery_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_timeline" ADD CONSTRAINT "_pages_v_blocks_gallery_timeline_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gallery_timeline" ADD CONSTRAINT "_pages_v_blocks_gallery_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_gallery_timeline_order_idx" ON "pages_blocks_gallery_timeline" USING btree ("_order");
  CREATE INDEX "pages_blocks_gallery_timeline_parent_id_idx" ON "pages_blocks_gallery_timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gallery_timeline_path_idx" ON "pages_blocks_gallery_timeline" USING btree ("_path");
  CREATE INDEX "pages_blocks_gallery_timeline_locale_idx" ON "pages_blocks_gallery_timeline" USING btree ("_locale");
  CREATE INDEX "pages_blocks_gallery_timeline_category_idx" ON "pages_blocks_gallery_timeline" USING btree ("category_id");
  CREATE INDEX "_pages_v_blocks_gallery_timeline_order_idx" ON "_pages_v_blocks_gallery_timeline" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gallery_timeline_parent_id_idx" ON "_pages_v_blocks_gallery_timeline" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gallery_timeline_path_idx" ON "_pages_v_blocks_gallery_timeline" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gallery_timeline_locale_idx" ON "_pages_v_blocks_gallery_timeline" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_gallery_timeline_category_idx" ON "_pages_v_blocks_gallery_timeline" USING btree ("category_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_gallery_timeline" CASCADE;
  DROP TABLE "_pages_v_blocks_gallery_timeline" CASCADE;`)
}
