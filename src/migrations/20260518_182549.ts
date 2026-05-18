import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_media_block" ADD COLUMN "width_percent" numeric;
  ALTER TABLE "pages_blocks_media_block" ADD COLUMN "max_width" numeric;
  ALTER TABLE "pages_blocks_media_block" ADD COLUMN "caption" varchar;
  ALTER TABLE "pages_blocks_media_block" ADD COLUMN "show_media_caption" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "width_percent" numeric;
  ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "max_width" numeric;
  ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "caption" varchar;
  ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "show_media_caption" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_media_block" DROP COLUMN "width_percent";
  ALTER TABLE "pages_blocks_media_block" DROP COLUMN "max_width";
  ALTER TABLE "pages_blocks_media_block" DROP COLUMN "caption";
  ALTER TABLE "pages_blocks_media_block" DROP COLUMN "show_media_caption";
  ALTER TABLE "_pages_v_blocks_media_block" DROP COLUMN "width_percent";
  ALTER TABLE "_pages_v_blocks_media_block" DROP COLUMN "max_width";
  ALTER TABLE "_pages_v_blocks_media_block" DROP COLUMN "caption";
  ALTER TABLE "_pages_v_blocks_media_block" DROP COLUMN "show_media_caption";`)
}
