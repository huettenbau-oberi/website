import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  -- ============================================================
  -- PHASE 1: add unlocalized columns (+ FKs) to parent tables
  -- (the indexes for these columns are created in phase 3, after the
  -- _locales tables that currently hold same-named indexes are dropped)
  -- ============================================================
  ALTER TABLE "pages" ADD COLUMN "title" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_type" "enum_pages_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "pages" ADD COLUMN "hero_tagline" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_background_media_id" integer;
  ALTER TABLE "pages" ADD COLUMN "hero_subtitle" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_category_id" integer;
  ALTER TABLE "pages" ADD COLUMN "hero_rich_text" jsonb;
  ALTER TABLE "pages" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "pages" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_tagline" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_background_media_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_subtitle" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_category_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_rich_text" jsonb;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "posts" ADD COLUMN "title" varchar;
  ALTER TABLE "posts" ADD COLUMN "content" jsonb;
  ALTER TABLE "posts" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "posts" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "posts" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_content" jsonb;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "categories" ADD COLUMN "title" varchar;
  ALTER TABLE "forms_blocks_checkbox" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_country" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_email" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_message" ADD COLUMN "message" jsonb;
  ALTER TABLE "forms_blocks_number" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_select" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_select" ADD COLUMN "default_value" varchar;
  ALTER TABLE "forms_blocks_select_options" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_state" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_text" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_text" ADD COLUMN "default_value" varchar;
  ALTER TABLE "forms_blocks_textarea" ADD COLUMN "label" varchar;
  ALTER TABLE "forms_blocks_textarea" ADD COLUMN "default_value" varchar;
  ALTER TABLE "forms_emails" ADD COLUMN "subject" varchar DEFAULT 'You''ve received a new message.';
  ALTER TABLE "forms_emails" ADD COLUMN "message" jsonb;
  ALTER TABLE "forms" ADD COLUMN "submit_button_label" varchar;
  ALTER TABLE "forms" ADD COLUMN "confirmation_message" jsonb;
  ALTER TABLE "search" ADD COLUMN "title" varchar;
  ALTER TABLE "banner" ADD COLUMN "text" jsonb;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_background_media_id_media_id_fk" FOREIGN KEY ("hero_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_category_id_categories_id_fk" FOREIGN KEY ("hero_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_background_media_id_media_id_fk" FOREIGN KEY ("version_hero_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_category_id_categories_id_fk" FOREIGN KEY ("version_hero_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

  -- ============================================================
  -- PHASE 2: merge "de" locale data into the parent tables
  -- ============================================================
  UPDATE "pages" p SET
  	"title" = l."title",
  	"hero_type" = l."hero_type",
  	"hero_tagline" = l."hero_tagline",
  	"hero_background_media_id" = l."hero_background_media_id",
  	"hero_subtitle" = l."hero_subtitle",
  	"hero_category_id" = l."hero_category_id",
  	"hero_rich_text" = l."hero_rich_text",
  	"meta_title" = l."meta_title",
  	"meta_image_id" = l."meta_image_id",
  	"meta_description" = l."meta_description"
  FROM "pages_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "_pages_v" p SET
  	"version_title" = l."version_title",
  	"version_hero_type" = l."version_hero_type",
  	"version_hero_tagline" = l."version_hero_tagline",
  	"version_hero_background_media_id" = l."version_hero_background_media_id",
  	"version_hero_subtitle" = l."version_hero_subtitle",
  	"version_hero_category_id" = l."version_hero_category_id",
  	"version_hero_rich_text" = l."version_hero_rich_text",
  	"version_meta_title" = l."version_meta_title",
  	"version_meta_image_id" = l."version_meta_image_id",
  	"version_meta_description" = l."version_meta_description"
  FROM "_pages_v_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "posts" p SET
  	"title" = l."title",
  	"content" = l."content",
  	"meta_title" = l."meta_title",
  	"meta_image_id" = l."meta_image_id",
  	"meta_description" = l."meta_description"
  FROM "posts_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "_posts_v" p SET
  	"version_title" = l."version_title",
  	"version_content" = l."version_content",
  	"version_meta_title" = l."version_meta_title",
  	"version_meta_image_id" = l."version_meta_image_id",
  	"version_meta_description" = l."version_meta_description"
  FROM "_posts_v_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "categories" p SET
  	"title" = l."title"
  FROM "categories_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "forms_blocks_checkbox" p SET
  	"label" = l."label"
  FROM "forms_blocks_checkbox_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "forms_blocks_country" p SET
  	"label" = l."label"
  FROM "forms_blocks_country_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "forms_blocks_email" p SET
  	"label" = l."label"
  FROM "forms_blocks_email_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "forms_blocks_message" p SET
  	"message" = l."message"
  FROM "forms_blocks_message_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "forms_blocks_number" p SET
  	"label" = l."label"
  FROM "forms_blocks_number_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "forms_blocks_select" p SET
  	"label" = l."label",
  	"default_value" = l."default_value"
  FROM "forms_blocks_select_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "forms_blocks_select_options" p SET
  	"label" = l."label"
  FROM "forms_blocks_select_options_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "forms_blocks_state" p SET
  	"label" = l."label"
  FROM "forms_blocks_state_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "forms_blocks_text" p SET
  	"label" = l."label",
  	"default_value" = l."default_value"
  FROM "forms_blocks_text_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "forms_blocks_textarea" p SET
  	"label" = l."label",
  	"default_value" = l."default_value"
  FROM "forms_blocks_textarea_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "forms_emails" p SET
  	"subject" = l."subject",
  	"message" = l."message"
  FROM "forms_emails_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "forms" p SET
  	"submit_button_label" = l."submit_button_label",
  	"confirmation_message" = l."confirmation_message"
  FROM "forms_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "search" p SET
  	"title" = l."title"
  FROM "search_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';
  UPDATE "banner" p SET
  	"text" = l."text"
  FROM "banner_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'de';

  -- ============================================================
  -- PHASE 2b: tighten NOT NULL constraints now that data is merged
  -- ============================================================
  ALTER TABLE "categories" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "forms_blocks_select_options" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "forms_emails" ALTER COLUMN "subject" SET NOT NULL;

  -- ============================================================
  -- PHASE 3: drop English rows + locale columns/indexes, then drop
  -- the _locales side-tables
  -- ============================================================
  DELETE FROM "pages_blocks_camp_facts_facts" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_camp_facts_facts_locale_idx";
  ALTER TABLE "pages_blocks_camp_facts_facts" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_camp_facts" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_camp_facts_locale_idx";
  ALTER TABLE "pages_blocks_camp_facts" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_camp_gallery_images" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_camp_gallery_images_locale_idx";
  ALTER TABLE "pages_blocks_camp_gallery_images" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_camp_gallery_icons" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_camp_gallery_icons_locale_idx";
  ALTER TABLE "pages_blocks_camp_gallery_icons" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_camp_gallery" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_camp_gallery_locale_idx";
  ALTER TABLE "pages_blocks_camp_gallery" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_camp_hero_links" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_camp_hero_links_locale_idx";
  ALTER TABLE "pages_blocks_camp_hero_links" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_camp_hero" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_camp_hero_locale_idx";
  ALTER TABLE "pages_blocks_camp_hero" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_camp_main" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_camp_main_locale_idx";
  ALTER TABLE "pages_blocks_camp_main" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_camp_sponsors_main_sponsors" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_camp_sponsors_main_sponsors_locale_idx";
  ALTER TABLE "pages_blocks_camp_sponsors_main_sponsors" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_camp_sponsors_sponsors" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_camp_sponsors_sponsors_locale_idx";
  ALTER TABLE "pages_blocks_camp_sponsors_sponsors" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_camp_sponsors_links" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_camp_sponsors_links_locale_idx";
  ALTER TABLE "pages_blocks_camp_sponsors_links" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_camp_sponsors" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_camp_sponsors_locale_idx";
  ALTER TABLE "pages_blocks_camp_sponsors" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_content_columns" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_content_columns_locale_idx";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_content" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_content_locale_idx";
  ALTER TABLE "pages_blocks_content" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_html_block" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_html_block_locale_idx";
  ALTER TABLE "pages_blocks_html_block" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_iframe_block" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_iframe_block_locale_idx";
  ALTER TABLE "pages_blocks_iframe_block" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_media_block" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_media_block_locale_idx";
  ALTER TABLE "pages_blocks_media_block" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_form_block" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_form_block_locale_idx";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "_locale";
  DELETE FROM "pages_blocks_gallery_timeline" WHERE "_locale" = 'en';
  DROP INDEX "pages_blocks_gallery_timeline_locale_idx";
  ALTER TABLE "pages_blocks_gallery_timeline" DROP COLUMN "_locale";
  DELETE FROM "pages_rels" WHERE "locale" = 'en';
  DROP INDEX "pages_rels_locale_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "locale";
  DELETE FROM "_pages_v_blocks_camp_facts_facts" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_camp_facts_facts_locale_idx";
  ALTER TABLE "_pages_v_blocks_camp_facts_facts" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_camp_facts" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_camp_facts_locale_idx";
  ALTER TABLE "_pages_v_blocks_camp_facts" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_camp_gallery_images" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_camp_gallery_images_locale_idx";
  ALTER TABLE "_pages_v_blocks_camp_gallery_images" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_camp_gallery_icons" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_camp_gallery_icons_locale_idx";
  ALTER TABLE "_pages_v_blocks_camp_gallery_icons" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_camp_gallery" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_camp_gallery_locale_idx";
  ALTER TABLE "_pages_v_blocks_camp_gallery" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_camp_hero_links" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_camp_hero_links_locale_idx";
  ALTER TABLE "_pages_v_blocks_camp_hero_links" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_camp_hero" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_camp_hero_locale_idx";
  ALTER TABLE "_pages_v_blocks_camp_hero" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_camp_main" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_camp_main_locale_idx";
  ALTER TABLE "_pages_v_blocks_camp_main" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_camp_sponsors_main_sponsors" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_camp_sponsors_main_sponsors_locale_idx";
  ALTER TABLE "_pages_v_blocks_camp_sponsors_main_sponsors" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_camp_sponsors_sponsors" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_camp_sponsors_sponsors_locale_idx";
  ALTER TABLE "_pages_v_blocks_camp_sponsors_sponsors" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_camp_sponsors_links" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_camp_sponsors_links_locale_idx";
  ALTER TABLE "_pages_v_blocks_camp_sponsors_links" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_camp_sponsors" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_camp_sponsors_locale_idx";
  ALTER TABLE "_pages_v_blocks_camp_sponsors" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_content_columns" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_content_columns_locale_idx";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_content" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_content_locale_idx";
  ALTER TABLE "_pages_v_blocks_content" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_html_block" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_html_block_locale_idx";
  ALTER TABLE "_pages_v_blocks_html_block" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_iframe_block" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_iframe_block_locale_idx";
  ALTER TABLE "_pages_v_blocks_iframe_block" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_media_block" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_media_block_locale_idx";
  ALTER TABLE "_pages_v_blocks_media_block" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_form_block" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_form_block_locale_idx";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_blocks_gallery_timeline" WHERE "_locale" = 'en';
  DROP INDEX "_pages_v_blocks_gallery_timeline_locale_idx";
  ALTER TABLE "_pages_v_blocks_gallery_timeline" DROP COLUMN "_locale";
  DELETE FROM "_pages_v_rels" WHERE "locale" = 'en';
  DROP INDEX "_pages_v_rels_locale_idx";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "locale";
  DELETE FROM "posts_blocks_content_columns" WHERE "_locale" = 'en';
  DROP INDEX "posts_blocks_content_columns_locale_idx";
  ALTER TABLE "posts_blocks_content_columns" DROP COLUMN "_locale";
  DELETE FROM "posts_blocks_content" WHERE "_locale" = 'en';
  DROP INDEX "posts_blocks_content_locale_idx";
  ALTER TABLE "posts_blocks_content" DROP COLUMN "_locale";
  DELETE FROM "posts_blocks_html_block" WHERE "_locale" = 'en';
  DROP INDEX "posts_blocks_html_block_locale_idx";
  ALTER TABLE "posts_blocks_html_block" DROP COLUMN "_locale";
  DELETE FROM "posts_blocks_iframe_block" WHERE "_locale" = 'en';
  DROP INDEX "posts_blocks_iframe_block_locale_idx";
  ALTER TABLE "posts_blocks_iframe_block" DROP COLUMN "_locale";
  DELETE FROM "posts_blocks_media_block" WHERE "_locale" = 'en';
  DROP INDEX "posts_blocks_media_block_locale_idx";
  ALTER TABLE "posts_blocks_media_block" DROP COLUMN "_locale";
  DELETE FROM "posts_blocks_form_block" WHERE "_locale" = 'en';
  DROP INDEX "posts_blocks_form_block_locale_idx";
  ALTER TABLE "posts_blocks_form_block" DROP COLUMN "_locale";
  DELETE FROM "posts_blocks_post_section" WHERE "_locale" = 'en';
  DROP INDEX "posts_blocks_post_section_locale_idx";
  ALTER TABLE "posts_blocks_post_section" DROP COLUMN "_locale";
  DELETE FROM "posts_blocks_gallery_grid_left_images" WHERE "_locale" = 'en';
  DROP INDEX "posts_blocks_gallery_grid_left_images_locale_idx";
  ALTER TABLE "posts_blocks_gallery_grid_left_images" DROP COLUMN "_locale";
  DELETE FROM "posts_blocks_gallery_grid_right_images" WHERE "_locale" = 'en';
  DROP INDEX "posts_blocks_gallery_grid_right_images_locale_idx";
  ALTER TABLE "posts_blocks_gallery_grid_right_images" DROP COLUMN "_locale";
  DELETE FROM "posts_blocks_gallery_grid" WHERE "_locale" = 'en';
  DROP INDEX "posts_blocks_gallery_grid_locale_idx";
  ALTER TABLE "posts_blocks_gallery_grid" DROP COLUMN "_locale";
  DELETE FROM "posts_rels" WHERE "locale" = 'en';
  DROP INDEX "posts_rels_locale_idx";
  ALTER TABLE "posts_rels" DROP COLUMN "locale";
  DELETE FROM "_posts_v_blocks_content_columns" WHERE "_locale" = 'en';
  DROP INDEX "_posts_v_blocks_content_columns_locale_idx";
  ALTER TABLE "_posts_v_blocks_content_columns" DROP COLUMN "_locale";
  DELETE FROM "_posts_v_blocks_content" WHERE "_locale" = 'en';
  DROP INDEX "_posts_v_blocks_content_locale_idx";
  ALTER TABLE "_posts_v_blocks_content" DROP COLUMN "_locale";
  DELETE FROM "_posts_v_blocks_html_block" WHERE "_locale" = 'en';
  DROP INDEX "_posts_v_blocks_html_block_locale_idx";
  ALTER TABLE "_posts_v_blocks_html_block" DROP COLUMN "_locale";
  DELETE FROM "_posts_v_blocks_iframe_block" WHERE "_locale" = 'en';
  DROP INDEX "_posts_v_blocks_iframe_block_locale_idx";
  ALTER TABLE "_posts_v_blocks_iframe_block" DROP COLUMN "_locale";
  DELETE FROM "_posts_v_blocks_media_block" WHERE "_locale" = 'en';
  DROP INDEX "_posts_v_blocks_media_block_locale_idx";
  ALTER TABLE "_posts_v_blocks_media_block" DROP COLUMN "_locale";
  DELETE FROM "_posts_v_blocks_form_block" WHERE "_locale" = 'en';
  DROP INDEX "_posts_v_blocks_form_block_locale_idx";
  ALTER TABLE "_posts_v_blocks_form_block" DROP COLUMN "_locale";
  DELETE FROM "_posts_v_blocks_post_section" WHERE "_locale" = 'en';
  DROP INDEX "_posts_v_blocks_post_section_locale_idx";
  ALTER TABLE "_posts_v_blocks_post_section" DROP COLUMN "_locale";
  DELETE FROM "_posts_v_blocks_gallery_grid_left_images" WHERE "_locale" = 'en';
  DROP INDEX "_posts_v_blocks_gallery_grid_left_images_locale_idx";
  ALTER TABLE "_posts_v_blocks_gallery_grid_left_images" DROP COLUMN "_locale";
  DELETE FROM "_posts_v_blocks_gallery_grid_right_images" WHERE "_locale" = 'en';
  DROP INDEX "_posts_v_blocks_gallery_grid_right_images_locale_idx";
  ALTER TABLE "_posts_v_blocks_gallery_grid_right_images" DROP COLUMN "_locale";
  DELETE FROM "_posts_v_blocks_gallery_grid" WHERE "_locale" = 'en';
  DROP INDEX "_posts_v_blocks_gallery_grid_locale_idx";
  ALTER TABLE "_posts_v_blocks_gallery_grid" DROP COLUMN "_locale";
  DELETE FROM "_posts_v_rels" WHERE "locale" = 'en';
  DROP INDEX "_posts_v_rels_locale_idx";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "locale";
  DELETE FROM "categories_breadcrumbs" WHERE "_locale" = 'en';
  DROP INDEX "categories_breadcrumbs_locale_idx";
  ALTER TABLE "categories_breadcrumbs" DROP COLUMN "_locale";
  DELETE FROM "header_nav_items" WHERE "_locale" = 'en';
  DROP INDEX "header_nav_items_locale_idx";
  ALTER TABLE "header_nav_items" DROP COLUMN "_locale";
  DELETE FROM "header_rels" WHERE "locale" = 'en';
  DROP INDEX "header_rels_locale_idx";
  ALTER TABLE "header_rels" DROP COLUMN "locale";
  DELETE FROM "footer_legal_items" WHERE "_locale" = 'en';
  DROP INDEX "footer_legal_items_locale_idx";
  ALTER TABLE "footer_legal_items" DROP COLUMN "_locale";
  DELETE FROM "footer_nav_items_links" WHERE "_locale" = 'en';
  DROP INDEX "footer_nav_items_links_locale_idx";
  ALTER TABLE "footer_nav_items_links" DROP COLUMN "_locale";
  DELETE FROM "footer_nav_items" WHERE "_locale" = 'en';
  DROP INDEX "footer_nav_items_locale_idx";
  ALTER TABLE "footer_nav_items" DROP COLUMN "_locale";
  DELETE FROM "footer_rels" WHERE "locale" = 'en';
  DROP INDEX "footer_rels_locale_idx";
  ALTER TABLE "footer_rels" DROP COLUMN "locale";
  DROP INDEX "_pages_v_snapshot_idx";
  DROP INDEX "_pages_v_published_locale_idx";
  ALTER TABLE "_pages_v" DROP COLUMN "snapshot";
  ALTER TABLE "_pages_v" DROP COLUMN "published_locale";
  DROP INDEX "_posts_v_snapshot_idx";
  DROP INDEX "_posts_v_published_locale_idx";
  ALTER TABLE "_posts_v" DROP COLUMN "snapshot";
  ALTER TABLE "_posts_v" DROP COLUMN "published_locale";
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "forms_blocks_checkbox_locales" CASCADE;
  DROP TABLE "forms_blocks_country_locales" CASCADE;
  DROP TABLE "forms_blocks_email_locales" CASCADE;
  DROP TABLE "forms_blocks_message_locales" CASCADE;
  DROP TABLE "forms_blocks_number_locales" CASCADE;
  DROP TABLE "forms_blocks_select_locales" CASCADE;
  DROP TABLE "forms_blocks_select_options_locales" CASCADE;
  DROP TABLE "forms_blocks_state_locales" CASCADE;
  DROP TABLE "forms_blocks_text_locales" CASCADE;
  DROP TABLE "forms_blocks_textarea_locales" CASCADE;
  DROP TABLE "forms_emails_locales" CASCADE;
  DROP TABLE "forms_locales" CASCADE;
  DROP TABLE "search_locales" CASCADE;
  DROP TABLE "banner_locales" CASCADE;

  -- ============================================================
  -- PHASE 3d: create indexes for the merged columns now that the
  -- _locales tables (and their same-named indexes) are gone
  -- ============================================================
  CREATE INDEX "pages_hero_hero_background_media_idx" ON "pages" USING btree ("hero_background_media_id");
  CREATE INDEX "pages_hero_hero_category_idx" ON "pages" USING btree ("hero_category_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_background_media_idx" ON "_pages_v" USING btree ("version_hero_background_media_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_category_idx" ON "_pages_v" USING btree ("version_hero_category_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");

  -- ============================================================
  -- PHASE 4: drop locale enum types
  -- ============================================================
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum__posts_v_published_locale";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  -- ============================================================
  -- recreate locale enum types
  -- ============================================================
  CREATE TYPE "public"."_locales" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('de', 'en');

  -- ============================================================
  -- drop indexes on the merged columns first - the _locales tables
  -- recreated below have indexes with the same names
  -- ============================================================
  DROP INDEX "pages_hero_hero_background_media_idx";
  DROP INDEX "pages_hero_hero_category_idx";
  DROP INDEX "pages_meta_meta_image_idx";
  DROP INDEX "_pages_v_version_hero_version_hero_background_media_idx";
  DROP INDEX "_pages_v_version_hero_version_hero_category_idx";
  DROP INDEX "_pages_v_version_meta_version_meta_image_idx";
  DROP INDEX "posts_meta_meta_image_idx";
  DROP INDEX "_posts_v_version_meta_version_meta_image_idx";

  -- ============================================================
  -- recreate _locales side-tables (empty - no data restoration)
  -- ============================================================
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"hero_type" "enum_pages_hero_type" DEFAULT 'lowImpact',
  	"hero_tagline" varchar,
  	"hero_background_media_id" integer,
  	"hero_subtitle" varchar,
  	"hero_category_id" integer,
  	"hero_rich_text" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_tagline" varchar,
  	"version_hero_background_media_id" integer,
  	"version_hero_subtitle" varchar,
  	"version_hero_category_id" integer,
  	"version_hero_rich_text" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  CREATE TABLE "posts_locales" (
  	"title" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  CREATE TABLE "_posts_v_locales" (
  	"version_title" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  CREATE TABLE "categories_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  CREATE TABLE "forms_blocks_checkbox_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  CREATE TABLE "forms_blocks_country_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  CREATE TABLE "forms_blocks_email_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  CREATE TABLE "forms_blocks_message_locales" (
  	"message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  CREATE TABLE "forms_blocks_number_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  CREATE TABLE "forms_blocks_select_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  CREATE TABLE "forms_blocks_select_options_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  CREATE TABLE "forms_blocks_state_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  CREATE TABLE "forms_blocks_text_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  CREATE TABLE "forms_blocks_textarea_locales" (
  	"label" varchar,
  	"default_value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  CREATE TABLE "forms_emails_locales" (
  	"subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL,
  	"message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  CREATE TABLE "forms_locales" (
  	"submit_button_label" varchar,
  	"confirmation_message" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  CREATE TABLE "search_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  CREATE TABLE "banner_locales" (
  	"text" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_hero_background_media_id_media_id_fk" FOREIGN KEY ("hero_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_hero_category_id_categories_id_fk" FOREIGN KEY ("hero_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_hero_background_media_id_media_id_fk" FOREIGN KEY ("version_hero_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_hero_category_id_categories_id_fk" FOREIGN KEY ("version_hero_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox_locales" ADD CONSTRAINT "forms_blocks_checkbox_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_checkbox"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_country_locales" ADD CONSTRAINT "forms_blocks_country_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_country"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email_locales" ADD CONSTRAINT "forms_blocks_email_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_email"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message_locales" ADD CONSTRAINT "forms_blocks_message_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_message"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number_locales" ADD CONSTRAINT "forms_blocks_number_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_number"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_locales" ADD CONSTRAINT "forms_blocks_select_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options_locales" ADD CONSTRAINT "forms_blocks_select_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_state_locales" ADD CONSTRAINT "forms_blocks_state_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_state"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text_locales" ADD CONSTRAINT "forms_blocks_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea_locales" ADD CONSTRAINT "forms_blocks_textarea_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_textarea"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails_locales" ADD CONSTRAINT "forms_emails_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_emails"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_locales" ADD CONSTRAINT "forms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_locales" ADD CONSTRAINT "search_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "banner_locales" ADD CONSTRAINT "banner_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."banner"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_hero_background_media_idx" ON "pages_locales" USING btree ("hero_background_media_id");
  CREATE INDEX "pages_hero_hero_category_idx" ON "pages_locales" USING btree ("hero_category_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_background_media_idx" ON "_pages_v_locales" USING btree ("version_hero_background_media_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_category_idx" ON "_pages_v_locales" USING btree ("version_hero_category_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_checkbox_locales_locale_parent_id_unique" ON "forms_blocks_checkbox_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_country_locales_locale_parent_id_unique" ON "forms_blocks_country_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_email_locales_locale_parent_id_unique" ON "forms_blocks_email_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_message_locales_locale_parent_id_unique" ON "forms_blocks_message_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_number_locales_locale_parent_id_unique" ON "forms_blocks_number_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_select_locales_locale_parent_id_unique" ON "forms_blocks_select_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_select_options_locales_locale_parent_id_unique" ON "forms_blocks_select_options_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_state_locales_locale_parent_id_unique" ON "forms_blocks_state_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_text_locales_locale_parent_id_unique" ON "forms_blocks_text_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "forms_blocks_textarea_locales_locale_parent_id_unique" ON "forms_blocks_textarea_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "forms_emails_locales_locale_parent_id_unique" ON "forms_emails_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "forms_locales_locale_parent_id_unique" ON "forms_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "search_locales_locale_parent_id_unique" ON "search_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "banner_locales_locale_parent_id_unique" ON "banner_locales" USING btree ("_locale","_parent_id");

  -- ============================================================
  -- recreate locale columns + indexes on block/array/rels tables
  -- ============================================================
  ALTER TABLE "pages_blocks_camp_facts_facts" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_camp_facts_facts_locale_idx" ON "pages_blocks_camp_facts_facts" USING btree ("_locale");
  ALTER TABLE "pages_blocks_camp_facts" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_camp_facts_locale_idx" ON "pages_blocks_camp_facts" USING btree ("_locale");
  ALTER TABLE "pages_blocks_camp_gallery_images" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_camp_gallery_images_locale_idx" ON "pages_blocks_camp_gallery_images" USING btree ("_locale");
  ALTER TABLE "pages_blocks_camp_gallery_icons" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_camp_gallery_icons_locale_idx" ON "pages_blocks_camp_gallery_icons" USING btree ("_locale");
  ALTER TABLE "pages_blocks_camp_gallery" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_camp_gallery_locale_idx" ON "pages_blocks_camp_gallery" USING btree ("_locale");
  ALTER TABLE "pages_blocks_camp_hero_links" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_camp_hero_links_locale_idx" ON "pages_blocks_camp_hero_links" USING btree ("_locale");
  ALTER TABLE "pages_blocks_camp_hero" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_camp_hero_locale_idx" ON "pages_blocks_camp_hero" USING btree ("_locale");
  ALTER TABLE "pages_blocks_camp_main" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_camp_main_locale_idx" ON "pages_blocks_camp_main" USING btree ("_locale");
  ALTER TABLE "pages_blocks_camp_sponsors_main_sponsors" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_camp_sponsors_main_sponsors_locale_idx" ON "pages_blocks_camp_sponsors_main_sponsors" USING btree ("_locale");
  ALTER TABLE "pages_blocks_camp_sponsors_sponsors" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_camp_sponsors_sponsors_locale_idx" ON "pages_blocks_camp_sponsors_sponsors" USING btree ("_locale");
  ALTER TABLE "pages_blocks_camp_sponsors_links" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_camp_sponsors_links_locale_idx" ON "pages_blocks_camp_sponsors_links" USING btree ("_locale");
  ALTER TABLE "pages_blocks_camp_sponsors" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_camp_sponsors_locale_idx" ON "pages_blocks_camp_sponsors" USING btree ("_locale");
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_content_columns_locale_idx" ON "pages_blocks_content_columns" USING btree ("_locale");
  ALTER TABLE "pages_blocks_content" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_content_locale_idx" ON "pages_blocks_content" USING btree ("_locale");
  ALTER TABLE "pages_blocks_html_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_html_block_locale_idx" ON "pages_blocks_html_block" USING btree ("_locale");
  ALTER TABLE "pages_blocks_iframe_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_iframe_block_locale_idx" ON "pages_blocks_iframe_block" USING btree ("_locale");
  ALTER TABLE "pages_blocks_media_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_media_block_locale_idx" ON "pages_blocks_media_block" USING btree ("_locale");
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_form_block_locale_idx" ON "pages_blocks_form_block" USING btree ("_locale");
  ALTER TABLE "pages_blocks_gallery_timeline" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "pages_blocks_gallery_timeline_locale_idx" ON "pages_blocks_gallery_timeline" USING btree ("_locale");
  ALTER TABLE "pages_rels" ADD COLUMN "locale" "_locales";
  CREATE INDEX "pages_rels_locale_idx" ON "pages_rels" USING btree ("locale");
  ALTER TABLE "_pages_v_blocks_camp_facts_facts" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_camp_facts_facts_locale_idx" ON "_pages_v_blocks_camp_facts_facts" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_camp_facts" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_camp_facts_locale_idx" ON "_pages_v_blocks_camp_facts" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_camp_gallery_images" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_camp_gallery_images_locale_idx" ON "_pages_v_blocks_camp_gallery_images" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_camp_gallery_icons" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_camp_gallery_icons_locale_idx" ON "_pages_v_blocks_camp_gallery_icons" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_camp_gallery" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_camp_gallery_locale_idx" ON "_pages_v_blocks_camp_gallery" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_camp_hero_links" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_camp_hero_links_locale_idx" ON "_pages_v_blocks_camp_hero_links" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_camp_hero" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_camp_hero_locale_idx" ON "_pages_v_blocks_camp_hero" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_camp_main" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_camp_main_locale_idx" ON "_pages_v_blocks_camp_main" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_camp_sponsors_main_sponsors" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_camp_sponsors_main_sponsors_locale_idx" ON "_pages_v_blocks_camp_sponsors_main_sponsors" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_camp_sponsors_sponsors" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_camp_sponsors_sponsors_locale_idx" ON "_pages_v_blocks_camp_sponsors_sponsors" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_camp_sponsors_links" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_camp_sponsors_links_locale_idx" ON "_pages_v_blocks_camp_sponsors_links" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_camp_sponsors" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_camp_sponsors_locale_idx" ON "_pages_v_blocks_camp_sponsors" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_content_columns_locale_idx" ON "_pages_v_blocks_content_columns" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_content" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_content_locale_idx" ON "_pages_v_blocks_content" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_html_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_html_block_locale_idx" ON "_pages_v_blocks_html_block" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_iframe_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_iframe_block_locale_idx" ON "_pages_v_blocks_iframe_block" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_media_block_locale_idx" ON "_pages_v_blocks_media_block" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_form_block_locale_idx" ON "_pages_v_blocks_form_block" USING btree ("_locale");
  ALTER TABLE "_pages_v_blocks_gallery_timeline" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_pages_v_blocks_gallery_timeline_locale_idx" ON "_pages_v_blocks_gallery_timeline" USING btree ("_locale");
  ALTER TABLE "_pages_v_rels" ADD COLUMN "locale" "_locales";
  CREATE INDEX "_pages_v_rels_locale_idx" ON "_pages_v_rels" USING btree ("locale");
  ALTER TABLE "posts_blocks_content_columns" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "posts_blocks_content_columns_locale_idx" ON "posts_blocks_content_columns" USING btree ("_locale");
  ALTER TABLE "posts_blocks_content" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "posts_blocks_content_locale_idx" ON "posts_blocks_content" USING btree ("_locale");
  ALTER TABLE "posts_blocks_html_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "posts_blocks_html_block_locale_idx" ON "posts_blocks_html_block" USING btree ("_locale");
  ALTER TABLE "posts_blocks_iframe_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "posts_blocks_iframe_block_locale_idx" ON "posts_blocks_iframe_block" USING btree ("_locale");
  ALTER TABLE "posts_blocks_media_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "posts_blocks_media_block_locale_idx" ON "posts_blocks_media_block" USING btree ("_locale");
  ALTER TABLE "posts_blocks_form_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "posts_blocks_form_block_locale_idx" ON "posts_blocks_form_block" USING btree ("_locale");
  ALTER TABLE "posts_blocks_post_section" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "posts_blocks_post_section_locale_idx" ON "posts_blocks_post_section" USING btree ("_locale");
  ALTER TABLE "posts_blocks_gallery_grid_left_images" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "posts_blocks_gallery_grid_left_images_locale_idx" ON "posts_blocks_gallery_grid_left_images" USING btree ("_locale");
  ALTER TABLE "posts_blocks_gallery_grid_right_images" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "posts_blocks_gallery_grid_right_images_locale_idx" ON "posts_blocks_gallery_grid_right_images" USING btree ("_locale");
  ALTER TABLE "posts_blocks_gallery_grid" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "posts_blocks_gallery_grid_locale_idx" ON "posts_blocks_gallery_grid" USING btree ("_locale");
  ALTER TABLE "posts_rels" ADD COLUMN "locale" "_locales";
  CREATE INDEX "posts_rels_locale_idx" ON "posts_rels" USING btree ("locale");
  ALTER TABLE "_posts_v_blocks_content_columns" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_posts_v_blocks_content_columns_locale_idx" ON "_posts_v_blocks_content_columns" USING btree ("_locale");
  ALTER TABLE "_posts_v_blocks_content" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_posts_v_blocks_content_locale_idx" ON "_posts_v_blocks_content" USING btree ("_locale");
  ALTER TABLE "_posts_v_blocks_html_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_posts_v_blocks_html_block_locale_idx" ON "_posts_v_blocks_html_block" USING btree ("_locale");
  ALTER TABLE "_posts_v_blocks_iframe_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_posts_v_blocks_iframe_block_locale_idx" ON "_posts_v_blocks_iframe_block" USING btree ("_locale");
  ALTER TABLE "_posts_v_blocks_media_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_posts_v_blocks_media_block_locale_idx" ON "_posts_v_blocks_media_block" USING btree ("_locale");
  ALTER TABLE "_posts_v_blocks_form_block" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_posts_v_blocks_form_block_locale_idx" ON "_posts_v_blocks_form_block" USING btree ("_locale");
  ALTER TABLE "_posts_v_blocks_post_section" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_posts_v_blocks_post_section_locale_idx" ON "_posts_v_blocks_post_section" USING btree ("_locale");
  ALTER TABLE "_posts_v_blocks_gallery_grid_left_images" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_posts_v_blocks_gallery_grid_left_images_locale_idx" ON "_posts_v_blocks_gallery_grid_left_images" USING btree ("_locale");
  ALTER TABLE "_posts_v_blocks_gallery_grid_right_images" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_posts_v_blocks_gallery_grid_right_images_locale_idx" ON "_posts_v_blocks_gallery_grid_right_images" USING btree ("_locale");
  ALTER TABLE "_posts_v_blocks_gallery_grid" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "_posts_v_blocks_gallery_grid_locale_idx" ON "_posts_v_blocks_gallery_grid" USING btree ("_locale");
  ALTER TABLE "_posts_v_rels" ADD COLUMN "locale" "_locales";
  CREATE INDEX "_posts_v_rels_locale_idx" ON "_posts_v_rels" USING btree ("locale");
  ALTER TABLE "categories_breadcrumbs" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "categories_breadcrumbs_locale_idx" ON "categories_breadcrumbs" USING btree ("_locale");
  ALTER TABLE "header_nav_items" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "header_nav_items_locale_idx" ON "header_nav_items" USING btree ("_locale");
  ALTER TABLE "header_rels" ADD COLUMN "locale" "_locales";
  CREATE INDEX "header_rels_locale_idx" ON "header_rels" USING btree ("locale");
  ALTER TABLE "footer_legal_items" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "footer_legal_items_locale_idx" ON "footer_legal_items" USING btree ("_locale");
  ALTER TABLE "footer_nav_items_links" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "footer_nav_items_links_locale_idx" ON "footer_nav_items_links" USING btree ("_locale");
  ALTER TABLE "footer_nav_items" ADD COLUMN "_locale" "_locales" DEFAULT 'de' NOT NULL;
  CREATE INDEX "footer_nav_items_locale_idx" ON "footer_nav_items" USING btree ("_locale");
  ALTER TABLE "footer_rels" ADD COLUMN "locale" "_locales";
  CREATE INDEX "footer_rels_locale_idx" ON "footer_rels" USING btree ("locale");

  -- ============================================================
  -- recreate version-locale columns + indexes on _pages_v / _posts_v
  -- ============================================================
  ALTER TABLE "_pages_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_pages_v" ADD COLUMN "published_locale" "enum__pages_v_published_locale";
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  ALTER TABLE "_posts_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "published_locale" "enum__posts_v_published_locale";
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");

  -- ============================================================
  -- remove merged columns/FKs from parent tables (reverse phase 1)
  -- ============================================================
  ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_background_media_id_media_id_fk";
  ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_category_id_categories_id_fk";
  ALTER TABLE "pages" DROP CONSTRAINT "pages_meta_image_id_media_id_fk";
  ALTER TABLE "pages" DROP COLUMN "title";
  ALTER TABLE "pages" DROP COLUMN "hero_type";
  ALTER TABLE "pages" DROP COLUMN "hero_tagline";
  ALTER TABLE "pages" DROP COLUMN "hero_background_media_id";
  ALTER TABLE "pages" DROP COLUMN "hero_subtitle";
  ALTER TABLE "pages" DROP COLUMN "hero_category_id";
  ALTER TABLE "pages" DROP COLUMN "hero_rich_text";
  ALTER TABLE "pages" DROP COLUMN "meta_title";
  ALTER TABLE "pages" DROP COLUMN "meta_image_id";
  ALTER TABLE "pages" DROP COLUMN "meta_description";
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_hero_background_media_id_media_id_fk";
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_hero_category_id_categories_id_fk";
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk";
  ALTER TABLE "_pages_v" DROP COLUMN "version_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_type";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_tagline";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_background_media_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_subtitle";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_category_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_rich_text";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "posts" DROP CONSTRAINT "posts_meta_image_id_media_id_fk";
  ALTER TABLE "posts" DROP COLUMN "title";
  ALTER TABLE "posts" DROP COLUMN "content";
  ALTER TABLE "posts" DROP COLUMN "meta_title";
  ALTER TABLE "posts" DROP COLUMN "meta_image_id";
  ALTER TABLE "posts" DROP COLUMN "meta_description";
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk";
  ALTER TABLE "_posts_v" DROP COLUMN "version_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_content";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "categories" DROP COLUMN "title";
  ALTER TABLE "forms_blocks_checkbox" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_country" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_email" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_message" DROP COLUMN "message";
  ALTER TABLE "forms_blocks_number" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_select" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_select" DROP COLUMN "default_value";
  ALTER TABLE "forms_blocks_select_options" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_state" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_text" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_text" DROP COLUMN "default_value";
  ALTER TABLE "forms_blocks_textarea" DROP COLUMN "label";
  ALTER TABLE "forms_blocks_textarea" DROP COLUMN "default_value";
  ALTER TABLE "forms_emails" DROP COLUMN "subject";
  ALTER TABLE "forms_emails" DROP COLUMN "message";
  ALTER TABLE "forms" DROP COLUMN "submit_button_label";
  ALTER TABLE "forms" DROP COLUMN "confirmation_message";
  ALTER TABLE "search" DROP COLUMN "title";
  ALTER TABLE "banner" DROP COLUMN "text";`)
}
