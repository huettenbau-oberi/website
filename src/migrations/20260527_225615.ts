import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_media_block" ALTER COLUMN "caption" SET DATA TYPE jsonb;
  ALTER TABLE "pages_blocks_media_block" ALTER COLUMN "show_media_caption" SET DEFAULT true;
  ALTER TABLE "_pages_v_blocks_media_block" ALTER COLUMN "caption" SET DATA TYPE jsonb;
  ALTER TABLE "_pages_v_blocks_media_block" ALTER COLUMN "show_media_caption" SET DEFAULT true;
  ALTER TABLE "posts_blocks_media_block" ALTER COLUMN "caption" SET DATA TYPE jsonb;
  ALTER TABLE "posts_blocks_media_block" ALTER COLUMN "show_media_caption" SET DEFAULT true;
  ALTER TABLE "_posts_v_blocks_media_block" ALTER COLUMN "caption" SET DATA TYPE jsonb;
  ALTER TABLE "_posts_v_blocks_media_block" ALTER COLUMN "show_media_caption" SET DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_media_block" ALTER COLUMN "caption" SET DATA TYPE varchar;
  ALTER TABLE "pages_blocks_media_block" ALTER COLUMN "show_media_caption" SET DEFAULT false;
  ALTER TABLE "_pages_v_blocks_media_block" ALTER COLUMN "caption" SET DATA TYPE varchar;
  ALTER TABLE "_pages_v_blocks_media_block" ALTER COLUMN "show_media_caption" SET DEFAULT false;
  ALTER TABLE "posts_blocks_media_block" ALTER COLUMN "caption" SET DATA TYPE varchar;
  ALTER TABLE "posts_blocks_media_block" ALTER COLUMN "show_media_caption" SET DEFAULT false;
  ALTER TABLE "_posts_v_blocks_media_block" ALTER COLUMN "caption" SET DATA TYPE varchar;
  ALTER TABLE "_posts_v_blocks_media_block" ALTER COLUMN "show_media_caption" SET DEFAULT false;`)
}
