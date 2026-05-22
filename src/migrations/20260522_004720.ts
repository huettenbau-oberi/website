import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_post_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_post_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_post_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_post_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_post_section" ADD CONSTRAINT "pages_blocks_post_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_post_section" ADD CONSTRAINT "_pages_v_blocks_post_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_post_section" ADD CONSTRAINT "posts_blocks_post_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_post_section" ADD CONSTRAINT "_posts_v_blocks_post_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_post_section_order_idx" ON "pages_blocks_post_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_post_section_parent_id_idx" ON "pages_blocks_post_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_post_section_path_idx" ON "pages_blocks_post_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_post_section_locale_idx" ON "pages_blocks_post_section" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_post_section_order_idx" ON "_pages_v_blocks_post_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_post_section_parent_id_idx" ON "_pages_v_blocks_post_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_post_section_path_idx" ON "_pages_v_blocks_post_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_post_section_locale_idx" ON "_pages_v_blocks_post_section" USING btree ("_locale");
  CREATE INDEX "posts_blocks_post_section_order_idx" ON "posts_blocks_post_section" USING btree ("_order");
  CREATE INDEX "posts_blocks_post_section_parent_id_idx" ON "posts_blocks_post_section" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_post_section_path_idx" ON "posts_blocks_post_section" USING btree ("_path");
  CREATE INDEX "posts_blocks_post_section_locale_idx" ON "posts_blocks_post_section" USING btree ("_locale");
  CREATE INDEX "_posts_v_blocks_post_section_order_idx" ON "_posts_v_blocks_post_section" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_post_section_parent_id_idx" ON "_posts_v_blocks_post_section" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_post_section_path_idx" ON "_posts_v_blocks_post_section" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_post_section_locale_idx" ON "_posts_v_blocks_post_section" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_post_section" CASCADE;
  DROP TABLE "_pages_v_blocks_post_section" CASCADE;
  DROP TABLE "posts_blocks_post_section" CASCADE;
  DROP TABLE "_posts_v_blocks_post_section" CASCADE;`)
}
