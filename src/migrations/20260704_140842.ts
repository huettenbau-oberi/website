import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_in_arbeit" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'In Arbeit',
  	"message" varchar DEFAULT 'Hier wird noch gesägt und gehämmert. Schau bald wieder vorbei!',
  	"progress" numeric,
  	"eta" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_in_arbeit" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'In Arbeit',
  	"message" varchar DEFAULT 'Hier wird noch gesägt und gehämmert. Schau bald wieder vorbei!',
  	"progress" numeric,
  	"eta" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_in_arbeit" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'In Arbeit',
  	"message" varchar DEFAULT 'Hier wird noch gesägt und gehämmert. Schau bald wieder vorbei!',
  	"progress" numeric,
  	"eta" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_in_arbeit" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'In Arbeit',
  	"message" varchar DEFAULT 'Hier wird noch gesägt und gehämmert. Schau bald wieder vorbei!',
  	"progress" numeric,
  	"eta" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "users" ALTER COLUMN "user_role" DROP NOT NULL;
  ALTER TABLE "pages_blocks_in_arbeit" ADD CONSTRAINT "pages_blocks_in_arbeit_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_in_arbeit" ADD CONSTRAINT "_pages_v_blocks_in_arbeit_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_in_arbeit" ADD CONSTRAINT "posts_blocks_in_arbeit_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_in_arbeit" ADD CONSTRAINT "_posts_v_blocks_in_arbeit_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_in_arbeit_order_idx" ON "pages_blocks_in_arbeit" USING btree ("_order");
  CREATE INDEX "pages_blocks_in_arbeit_parent_id_idx" ON "pages_blocks_in_arbeit" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_in_arbeit_path_idx" ON "pages_blocks_in_arbeit" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_in_arbeit_order_idx" ON "_pages_v_blocks_in_arbeit" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_in_arbeit_parent_id_idx" ON "_pages_v_blocks_in_arbeit" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_in_arbeit_path_idx" ON "_pages_v_blocks_in_arbeit" USING btree ("_path");
  CREATE INDEX "posts_blocks_in_arbeit_order_idx" ON "posts_blocks_in_arbeit" USING btree ("_order");
  CREATE INDEX "posts_blocks_in_arbeit_parent_id_idx" ON "posts_blocks_in_arbeit" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_in_arbeit_path_idx" ON "posts_blocks_in_arbeit" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_in_arbeit_order_idx" ON "_posts_v_blocks_in_arbeit" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_in_arbeit_parent_id_idx" ON "_posts_v_blocks_in_arbeit" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_in_arbeit_path_idx" ON "_posts_v_blocks_in_arbeit" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_in_arbeit" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_in_arbeit" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_in_arbeit" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_in_arbeit" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_in_arbeit" CASCADE;
  DROP TABLE "_pages_v_blocks_in_arbeit" CASCADE;
  DROP TABLE "posts_blocks_in_arbeit" CASCADE;
  DROP TABLE "_posts_v_blocks_in_arbeit" CASCADE;
  ALTER TABLE "users" ALTER COLUMN "user_role" SET NOT NULL;`)
}
