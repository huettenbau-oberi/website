import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_blocks_camp_gallery_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_posts_blocks_camp_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_posts_blocks_camp_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__posts_v_blocks_camp_gallery_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__posts_v_blocks_camp_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__posts_v_blocks_camp_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TABLE "posts_blocks_camp_facts_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"prefix" varchar,
  	"value" varchar,
  	"suffix" varchar
  );
  
  CREATE TABLE "posts_blocks_camp_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Fakten',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_camp_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "posts_blocks_camp_gallery_icons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon_id" integer
  );
  
  CREATE TABLE "posts_blocks_camp_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"link_type" "enum_posts_blocks_camp_gallery_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_camp_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_posts_blocks_camp_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_posts_blocks_camp_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "posts_blocks_camp_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"countdown_label" varchar DEFAULT 'Only...',
  	"countdown_date" timestamp(3) with time zone,
  	"countdown_suffix" varchar DEFAULT '...until camp begins!',
  	"registration_text" varchar,
  	"flyer_image_id" integer,
  	"flyer_file_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_camp_main" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text1" jsonb,
  	"image1_id" integer,
  	"rich_text2" jsonb,
  	"image2_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_camp_sponsors_sponsors" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"name" varchar
  );
  
  CREATE TABLE "posts_blocks_camp_sponsors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro_text" jsonb,
  	"outro_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_posts_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_posts_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_posts_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "posts_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_html_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"html" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_iframe_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"height" numeric DEFAULT 500,
  	"full_width" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"width_percent" numeric,
  	"max_width" numeric,
  	"caption" varchar,
  	"show_media_caption" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_gallery_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_camp_facts_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"prefix" varchar,
  	"value" varchar,
  	"suffix" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_camp_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Fakten',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_camp_gallery_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_camp_gallery_icons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_camp_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"link_type" "enum__posts_v_blocks_camp_gallery_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_camp_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__posts_v_blocks_camp_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__posts_v_blocks_camp_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_camp_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"countdown_label" varchar DEFAULT 'Only...',
  	"countdown_date" timestamp(3) with time zone,
  	"countdown_suffix" varchar DEFAULT '...until camp begins!',
  	"registration_text" varchar,
  	"flyer_image_id" integer,
  	"flyer_file_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_camp_main" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text1" jsonb,
  	"image1_id" integer,
  	"rich_text2" jsonb,
  	"image2_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_camp_sponsors_sponsors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_camp_sponsors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro_text" jsonb,
  	"outro_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__posts_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__posts_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__posts_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_html_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"html" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_iframe_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"height" numeric DEFAULT 500,
  	"full_width" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"width_percent" numeric,
  	"max_width" numeric,
  	"caption" varchar,
  	"show_media_caption" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_gallery_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "posts" ADD COLUMN "show_author" boolean DEFAULT false;
  ALTER TABLE "posts_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_show_author" boolean DEFAULT false;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "posts_blocks_camp_facts_facts" ADD CONSTRAINT "posts_blocks_camp_facts_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_camp_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_facts" ADD CONSTRAINT "posts_blocks_camp_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_gallery_images" ADD CONSTRAINT "posts_blocks_camp_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_gallery_images" ADD CONSTRAINT "posts_blocks_camp_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_camp_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_gallery_icons" ADD CONSTRAINT "posts_blocks_camp_gallery_icons_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_gallery_icons" ADD CONSTRAINT "posts_blocks_camp_gallery_icons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_camp_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_gallery" ADD CONSTRAINT "posts_blocks_camp_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_hero_links" ADD CONSTRAINT "posts_blocks_camp_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_camp_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_hero" ADD CONSTRAINT "posts_blocks_camp_hero_flyer_image_id_media_id_fk" FOREIGN KEY ("flyer_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_hero" ADD CONSTRAINT "posts_blocks_camp_hero_flyer_file_id_media_id_fk" FOREIGN KEY ("flyer_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_hero" ADD CONSTRAINT "posts_blocks_camp_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_main" ADD CONSTRAINT "posts_blocks_camp_main_image1_id_media_id_fk" FOREIGN KEY ("image1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_main" ADD CONSTRAINT "posts_blocks_camp_main_image2_id_media_id_fk" FOREIGN KEY ("image2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_main" ADD CONSTRAINT "posts_blocks_camp_main_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_sponsors_sponsors" ADD CONSTRAINT "posts_blocks_camp_sponsors_sponsors_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_sponsors_sponsors" ADD CONSTRAINT "posts_blocks_camp_sponsors_sponsors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_camp_sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_camp_sponsors" ADD CONSTRAINT "posts_blocks_camp_sponsors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_columns" ADD CONSTRAINT "posts_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_content" ADD CONSTRAINT "posts_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_html_block" ADD CONSTRAINT "posts_blocks_html_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_iframe_block" ADD CONSTRAINT "posts_blocks_iframe_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_media_block" ADD CONSTRAINT "posts_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_media_block" ADD CONSTRAINT "posts_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_form_block" ADD CONSTRAINT "posts_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_form_block" ADD CONSTRAINT "posts_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_gallery_timeline" ADD CONSTRAINT "posts_blocks_gallery_timeline_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_gallery_timeline" ADD CONSTRAINT "posts_blocks_gallery_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_facts_facts" ADD CONSTRAINT "_posts_v_blocks_camp_facts_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_camp_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_facts" ADD CONSTRAINT "_posts_v_blocks_camp_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_gallery_images" ADD CONSTRAINT "_posts_v_blocks_camp_gallery_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_gallery_images" ADD CONSTRAINT "_posts_v_blocks_camp_gallery_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_camp_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_gallery_icons" ADD CONSTRAINT "_posts_v_blocks_camp_gallery_icons_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_gallery_icons" ADD CONSTRAINT "_posts_v_blocks_camp_gallery_icons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_camp_gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_gallery" ADD CONSTRAINT "_posts_v_blocks_camp_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_hero_links" ADD CONSTRAINT "_posts_v_blocks_camp_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_camp_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_hero" ADD CONSTRAINT "_posts_v_blocks_camp_hero_flyer_image_id_media_id_fk" FOREIGN KEY ("flyer_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_hero" ADD CONSTRAINT "_posts_v_blocks_camp_hero_flyer_file_id_media_id_fk" FOREIGN KEY ("flyer_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_hero" ADD CONSTRAINT "_posts_v_blocks_camp_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_main" ADD CONSTRAINT "_posts_v_blocks_camp_main_image1_id_media_id_fk" FOREIGN KEY ("image1_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_main" ADD CONSTRAINT "_posts_v_blocks_camp_main_image2_id_media_id_fk" FOREIGN KEY ("image2_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_main" ADD CONSTRAINT "_posts_v_blocks_camp_main_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_sponsors_sponsors" ADD CONSTRAINT "_posts_v_blocks_camp_sponsors_sponsors_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_sponsors_sponsors" ADD CONSTRAINT "_posts_v_blocks_camp_sponsors_sponsors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_camp_sponsors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_camp_sponsors" ADD CONSTRAINT "_posts_v_blocks_camp_sponsors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_columns" ADD CONSTRAINT "_posts_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content" ADD CONSTRAINT "_posts_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_html_block" ADD CONSTRAINT "_posts_v_blocks_html_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_iframe_block" ADD CONSTRAINT "_posts_v_blocks_iframe_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_media_block" ADD CONSTRAINT "_posts_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_media_block" ADD CONSTRAINT "_posts_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_form_block" ADD CONSTRAINT "_posts_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_form_block" ADD CONSTRAINT "_posts_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_gallery_timeline" ADD CONSTRAINT "_posts_v_blocks_gallery_timeline_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_gallery_timeline" ADD CONSTRAINT "_posts_v_blocks_gallery_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_blocks_camp_facts_facts_order_idx" ON "posts_blocks_camp_facts_facts" USING btree ("_order");
  CREATE INDEX "posts_blocks_camp_facts_facts_parent_id_idx" ON "posts_blocks_camp_facts_facts" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_camp_facts_order_idx" ON "posts_blocks_camp_facts" USING btree ("_order");
  CREATE INDEX "posts_blocks_camp_facts_parent_id_idx" ON "posts_blocks_camp_facts" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_camp_facts_path_idx" ON "posts_blocks_camp_facts" USING btree ("_path");
  CREATE INDEX "posts_blocks_camp_gallery_images_order_idx" ON "posts_blocks_camp_gallery_images" USING btree ("_order");
  CREATE INDEX "posts_blocks_camp_gallery_images_parent_id_idx" ON "posts_blocks_camp_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_camp_gallery_images_image_idx" ON "posts_blocks_camp_gallery_images" USING btree ("image_id");
  CREATE INDEX "posts_blocks_camp_gallery_icons_order_idx" ON "posts_blocks_camp_gallery_icons" USING btree ("_order");
  CREATE INDEX "posts_blocks_camp_gallery_icons_parent_id_idx" ON "posts_blocks_camp_gallery_icons" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_camp_gallery_icons_icon_idx" ON "posts_blocks_camp_gallery_icons" USING btree ("icon_id");
  CREATE INDEX "posts_blocks_camp_gallery_order_idx" ON "posts_blocks_camp_gallery" USING btree ("_order");
  CREATE INDEX "posts_blocks_camp_gallery_parent_id_idx" ON "posts_blocks_camp_gallery" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_camp_gallery_path_idx" ON "posts_blocks_camp_gallery" USING btree ("_path");
  CREATE INDEX "posts_blocks_camp_hero_links_order_idx" ON "posts_blocks_camp_hero_links" USING btree ("_order");
  CREATE INDEX "posts_blocks_camp_hero_links_parent_id_idx" ON "posts_blocks_camp_hero_links" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_camp_hero_order_idx" ON "posts_blocks_camp_hero" USING btree ("_order");
  CREATE INDEX "posts_blocks_camp_hero_parent_id_idx" ON "posts_blocks_camp_hero" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_camp_hero_path_idx" ON "posts_blocks_camp_hero" USING btree ("_path");
  CREATE INDEX "posts_blocks_camp_hero_flyer_image_idx" ON "posts_blocks_camp_hero" USING btree ("flyer_image_id");
  CREATE INDEX "posts_blocks_camp_hero_flyer_file_idx" ON "posts_blocks_camp_hero" USING btree ("flyer_file_id");
  CREATE INDEX "posts_blocks_camp_main_order_idx" ON "posts_blocks_camp_main" USING btree ("_order");
  CREATE INDEX "posts_blocks_camp_main_parent_id_idx" ON "posts_blocks_camp_main" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_camp_main_path_idx" ON "posts_blocks_camp_main" USING btree ("_path");
  CREATE INDEX "posts_blocks_camp_main_image1_idx" ON "posts_blocks_camp_main" USING btree ("image1_id");
  CREATE INDEX "posts_blocks_camp_main_image2_idx" ON "posts_blocks_camp_main" USING btree ("image2_id");
  CREATE INDEX "posts_blocks_camp_sponsors_sponsors_order_idx" ON "posts_blocks_camp_sponsors_sponsors" USING btree ("_order");
  CREATE INDEX "posts_blocks_camp_sponsors_sponsors_parent_id_idx" ON "posts_blocks_camp_sponsors_sponsors" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_camp_sponsors_sponsors_image_idx" ON "posts_blocks_camp_sponsors_sponsors" USING btree ("image_id");
  CREATE INDEX "posts_blocks_camp_sponsors_order_idx" ON "posts_blocks_camp_sponsors" USING btree ("_order");
  CREATE INDEX "posts_blocks_camp_sponsors_parent_id_idx" ON "posts_blocks_camp_sponsors" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_camp_sponsors_path_idx" ON "posts_blocks_camp_sponsors" USING btree ("_path");
  CREATE INDEX "posts_blocks_content_columns_order_idx" ON "posts_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "posts_blocks_content_columns_parent_id_idx" ON "posts_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_content_order_idx" ON "posts_blocks_content" USING btree ("_order");
  CREATE INDEX "posts_blocks_content_parent_id_idx" ON "posts_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_content_path_idx" ON "posts_blocks_content" USING btree ("_path");
  CREATE INDEX "posts_blocks_html_block_order_idx" ON "posts_blocks_html_block" USING btree ("_order");
  CREATE INDEX "posts_blocks_html_block_parent_id_idx" ON "posts_blocks_html_block" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_html_block_path_idx" ON "posts_blocks_html_block" USING btree ("_path");
  CREATE INDEX "posts_blocks_iframe_block_order_idx" ON "posts_blocks_iframe_block" USING btree ("_order");
  CREATE INDEX "posts_blocks_iframe_block_parent_id_idx" ON "posts_blocks_iframe_block" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_iframe_block_path_idx" ON "posts_blocks_iframe_block" USING btree ("_path");
  CREATE INDEX "posts_blocks_media_block_order_idx" ON "posts_blocks_media_block" USING btree ("_order");
  CREATE INDEX "posts_blocks_media_block_parent_id_idx" ON "posts_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_media_block_path_idx" ON "posts_blocks_media_block" USING btree ("_path");
  CREATE INDEX "posts_blocks_media_block_media_idx" ON "posts_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "posts_blocks_form_block_order_idx" ON "posts_blocks_form_block" USING btree ("_order");
  CREATE INDEX "posts_blocks_form_block_parent_id_idx" ON "posts_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_form_block_path_idx" ON "posts_blocks_form_block" USING btree ("_path");
  CREATE INDEX "posts_blocks_form_block_form_idx" ON "posts_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "posts_blocks_gallery_timeline_order_idx" ON "posts_blocks_gallery_timeline" USING btree ("_order");
  CREATE INDEX "posts_blocks_gallery_timeline_parent_id_idx" ON "posts_blocks_gallery_timeline" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_gallery_timeline_path_idx" ON "posts_blocks_gallery_timeline" USING btree ("_path");
  CREATE INDEX "posts_blocks_gallery_timeline_category_idx" ON "posts_blocks_gallery_timeline" USING btree ("category_id");
  CREATE INDEX "_posts_v_blocks_camp_facts_facts_order_idx" ON "_posts_v_blocks_camp_facts_facts" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_camp_facts_facts_parent_id_idx" ON "_posts_v_blocks_camp_facts_facts" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_camp_facts_order_idx" ON "_posts_v_blocks_camp_facts" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_camp_facts_parent_id_idx" ON "_posts_v_blocks_camp_facts" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_camp_facts_path_idx" ON "_posts_v_blocks_camp_facts" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_camp_gallery_images_order_idx" ON "_posts_v_blocks_camp_gallery_images" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_camp_gallery_images_parent_id_idx" ON "_posts_v_blocks_camp_gallery_images" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_camp_gallery_images_image_idx" ON "_posts_v_blocks_camp_gallery_images" USING btree ("image_id");
  CREATE INDEX "_posts_v_blocks_camp_gallery_icons_order_idx" ON "_posts_v_blocks_camp_gallery_icons" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_camp_gallery_icons_parent_id_idx" ON "_posts_v_blocks_camp_gallery_icons" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_camp_gallery_icons_icon_idx" ON "_posts_v_blocks_camp_gallery_icons" USING btree ("icon_id");
  CREATE INDEX "_posts_v_blocks_camp_gallery_order_idx" ON "_posts_v_blocks_camp_gallery" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_camp_gallery_parent_id_idx" ON "_posts_v_blocks_camp_gallery" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_camp_gallery_path_idx" ON "_posts_v_blocks_camp_gallery" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_camp_hero_links_order_idx" ON "_posts_v_blocks_camp_hero_links" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_camp_hero_links_parent_id_idx" ON "_posts_v_blocks_camp_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_camp_hero_order_idx" ON "_posts_v_blocks_camp_hero" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_camp_hero_parent_id_idx" ON "_posts_v_blocks_camp_hero" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_camp_hero_path_idx" ON "_posts_v_blocks_camp_hero" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_camp_hero_flyer_image_idx" ON "_posts_v_blocks_camp_hero" USING btree ("flyer_image_id");
  CREATE INDEX "_posts_v_blocks_camp_hero_flyer_file_idx" ON "_posts_v_blocks_camp_hero" USING btree ("flyer_file_id");
  CREATE INDEX "_posts_v_blocks_camp_main_order_idx" ON "_posts_v_blocks_camp_main" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_camp_main_parent_id_idx" ON "_posts_v_blocks_camp_main" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_camp_main_path_idx" ON "_posts_v_blocks_camp_main" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_camp_main_image1_idx" ON "_posts_v_blocks_camp_main" USING btree ("image1_id");
  CREATE INDEX "_posts_v_blocks_camp_main_image2_idx" ON "_posts_v_blocks_camp_main" USING btree ("image2_id");
  CREATE INDEX "_posts_v_blocks_camp_sponsors_sponsors_order_idx" ON "_posts_v_blocks_camp_sponsors_sponsors" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_camp_sponsors_sponsors_parent_id_idx" ON "_posts_v_blocks_camp_sponsors_sponsors" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_camp_sponsors_sponsors_image_idx" ON "_posts_v_blocks_camp_sponsors_sponsors" USING btree ("image_id");
  CREATE INDEX "_posts_v_blocks_camp_sponsors_order_idx" ON "_posts_v_blocks_camp_sponsors" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_camp_sponsors_parent_id_idx" ON "_posts_v_blocks_camp_sponsors" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_camp_sponsors_path_idx" ON "_posts_v_blocks_camp_sponsors" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_content_columns_order_idx" ON "_posts_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_content_columns_parent_id_idx" ON "_posts_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_content_order_idx" ON "_posts_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_content_parent_id_idx" ON "_posts_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_content_path_idx" ON "_posts_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_html_block_order_idx" ON "_posts_v_blocks_html_block" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_html_block_parent_id_idx" ON "_posts_v_blocks_html_block" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_html_block_path_idx" ON "_posts_v_blocks_html_block" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_iframe_block_order_idx" ON "_posts_v_blocks_iframe_block" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_iframe_block_parent_id_idx" ON "_posts_v_blocks_iframe_block" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_iframe_block_path_idx" ON "_posts_v_blocks_iframe_block" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_media_block_order_idx" ON "_posts_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_media_block_parent_id_idx" ON "_posts_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_media_block_path_idx" ON "_posts_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_media_block_media_idx" ON "_posts_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_posts_v_blocks_form_block_order_idx" ON "_posts_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_form_block_parent_id_idx" ON "_posts_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_form_block_path_idx" ON "_posts_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_form_block_form_idx" ON "_posts_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_posts_v_blocks_gallery_timeline_order_idx" ON "_posts_v_blocks_gallery_timeline" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_gallery_timeline_parent_id_idx" ON "_posts_v_blocks_gallery_timeline" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_gallery_timeline_path_idx" ON "_posts_v_blocks_gallery_timeline" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_gallery_timeline_category_idx" ON "_posts_v_blocks_gallery_timeline" USING btree ("category_id");
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_rels_pages_id_idx" ON "posts_rels" USING btree ("pages_id");
  CREATE INDEX "_posts_v_rels_pages_id_idx" ON "_posts_v_rels" USING btree ("pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_blocks_camp_facts_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_camp_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_camp_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_camp_gallery_icons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_camp_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_camp_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_camp_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_camp_main" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_camp_sponsors_sponsors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_camp_sponsors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_html_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_iframe_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_media_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_gallery_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_camp_facts_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_camp_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_camp_gallery_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_camp_gallery_icons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_camp_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_camp_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_camp_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_camp_main" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_camp_sponsors_sponsors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_camp_sponsors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_html_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_iframe_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_media_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_gallery_timeline" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_blocks_camp_facts_facts" CASCADE;
  DROP TABLE "posts_blocks_camp_facts" CASCADE;
  DROP TABLE "posts_blocks_camp_gallery_images" CASCADE;
  DROP TABLE "posts_blocks_camp_gallery_icons" CASCADE;
  DROP TABLE "posts_blocks_camp_gallery" CASCADE;
  DROP TABLE "posts_blocks_camp_hero_links" CASCADE;
  DROP TABLE "posts_blocks_camp_hero" CASCADE;
  DROP TABLE "posts_blocks_camp_main" CASCADE;
  DROP TABLE "posts_blocks_camp_sponsors_sponsors" CASCADE;
  DROP TABLE "posts_blocks_camp_sponsors" CASCADE;
  DROP TABLE "posts_blocks_content_columns" CASCADE;
  DROP TABLE "posts_blocks_content" CASCADE;
  DROP TABLE "posts_blocks_html_block" CASCADE;
  DROP TABLE "posts_blocks_iframe_block" CASCADE;
  DROP TABLE "posts_blocks_media_block" CASCADE;
  DROP TABLE "posts_blocks_form_block" CASCADE;
  DROP TABLE "posts_blocks_gallery_timeline" CASCADE;
  DROP TABLE "_posts_v_blocks_camp_facts_facts" CASCADE;
  DROP TABLE "_posts_v_blocks_camp_facts" CASCADE;
  DROP TABLE "_posts_v_blocks_camp_gallery_images" CASCADE;
  DROP TABLE "_posts_v_blocks_camp_gallery_icons" CASCADE;
  DROP TABLE "_posts_v_blocks_camp_gallery" CASCADE;
  DROP TABLE "_posts_v_blocks_camp_hero_links" CASCADE;
  DROP TABLE "_posts_v_blocks_camp_hero" CASCADE;
  DROP TABLE "_posts_v_blocks_camp_main" CASCADE;
  DROP TABLE "_posts_v_blocks_camp_sponsors_sponsors" CASCADE;
  DROP TABLE "_posts_v_blocks_camp_sponsors" CASCADE;
  DROP TABLE "_posts_v_blocks_content_columns" CASCADE;
  DROP TABLE "_posts_v_blocks_content" CASCADE;
  DROP TABLE "_posts_v_blocks_html_block" CASCADE;
  DROP TABLE "_posts_v_blocks_iframe_block" CASCADE;
  DROP TABLE "_posts_v_blocks_media_block" CASCADE;
  DROP TABLE "_posts_v_blocks_form_block" CASCADE;
  DROP TABLE "_posts_v_blocks_gallery_timeline" CASCADE;
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_pages_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_pages_fk";
  
  DROP INDEX "posts_rels_pages_id_idx";
  DROP INDEX "_posts_v_rels_pages_id_idx";
  ALTER TABLE "posts" DROP COLUMN "show_author";
  ALTER TABLE "posts_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_show_author";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "pages_id";
  DROP TYPE "public"."enum_posts_blocks_camp_gallery_link_type";
  DROP TYPE "public"."enum_posts_blocks_camp_hero_links_link_type";
  DROP TYPE "public"."enum_posts_blocks_camp_hero_links_link_appearance";
  DROP TYPE "public"."enum_posts_blocks_content_columns_size";
  DROP TYPE "public"."enum_posts_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_posts_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__posts_v_blocks_camp_gallery_link_type";
  DROP TYPE "public"."enum__posts_v_blocks_camp_hero_links_link_type";
  DROP TYPE "public"."enum__posts_v_blocks_camp_hero_links_link_appearance";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_link_appearance";`)
}
