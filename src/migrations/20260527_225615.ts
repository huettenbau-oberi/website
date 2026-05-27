import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

const tables = [
  'pages_blocks_media_block',
  '_pages_v_blocks_media_block',
  'posts_blocks_media_block',
  '_posts_v_blocks_media_block',
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const table of tables) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "caption";`))
    await db.execute(sql.raw(`ALTER TABLE "${table}" ADD COLUMN "caption" jsonb;`))
    await db.execute(sql.raw(`ALTER TABLE "${table}" ALTER COLUMN "show_media_caption" SET DEFAULT true;`))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of tables) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "caption";`))
    await db.execute(sql.raw(`ALTER TABLE "${table}" ADD COLUMN "caption" varchar;`))
    await db.execute(sql.raw(`ALTER TABLE "${table}" ALTER COLUMN "show_media_caption" SET DEFAULT false;`))
  }
}
