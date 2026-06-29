import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_users_user_role" AS ENUM('viewer', 'editor', 'admin');

    ALTER TABLE "users"
      ADD COLUMN "user_role" "enum_users_user_role" NOT NULL DEFAULT 'viewer';

    -- Existing admins (is_admin = true) become 'admin'.
    UPDATE "users" SET "user_role" = 'admin' WHERE "is_admin" = true;

    -- Non-admin existing users become 'editor' to preserve their prior edit access.
    UPDATE "users" SET "user_role" = 'editor'
      WHERE "is_admin" = false OR "is_admin" IS NULL;

    ALTER TABLE "users" DROP COLUMN "is_admin";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN "is_admin" boolean DEFAULT false;

    UPDATE "users" SET "is_admin" = true WHERE "user_role" = 'admin';

    ALTER TABLE "users" DROP COLUMN "user_role";
    DROP TYPE "public"."enum_users_user_role";
  `)
}
