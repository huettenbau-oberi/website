import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds the `is_decorative` flag to `media`.
 *
 * Paired with conditionally-required alt-text in src/collections/Media.ts:
 *   - if `is_decorative = true`, alt may be empty and ImageMedia renders alt=""
 *   - if `is_decorative = false`, the admin UI enforces a non-empty alt before save
 *
 * Existing rows default to `false` (i.e. "not marked decorative"). Their `alt` is
 * not retroactively validated; the constraint only kicks in the next time an
 * admin edits the document. This was deliberate — backfilling alt for hundreds
 * of legacy images on rollout would break the deploy.
 *
 * Hand-written rather than CLI-generated: the matching JSON snapshot
 * (`20260520_013500.json`) was deliberately omitted because the local dev
 * database is in pushed-schema state, not migration state, and running
 * `payload generate:migrations` against it would have produced a snapshot
 * that diverged from the deployed schema. The runtime migration runner only
 * consumes the `up` / `down` exports, so omitting the snapshot is safe; the
 * snapshot can be regenerated on a properly-migrated DB next time the CLI is
 * used.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" ADD COLUMN "is_decorative" boolean DEFAULT false;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" DROP COLUMN "is_decorative";
  `)
}
