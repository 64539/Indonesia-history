-- Soft delete + partial unique slug (GIN FTS index is created via Drizzle schema / db:push)
ALTER TABLE "chapters" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;

ALTER TABLE "chapters" DROP CONSTRAINT IF EXISTS "chapters_slug_unique";

DROP INDEX IF EXISTS "chapters_slug_active_unique";

CREATE UNIQUE INDEX IF NOT EXISTS "chapters_slug_active_unique" ON "chapters" ("slug") WHERE "deleted_at" IS NULL;
