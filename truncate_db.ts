import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.log("Truncating tables...");
  await sql`TRUNCATE TABLE users, chapters, timelines, progress, quiz_scores CASCADE;`;
  console.log("Tables truncated.");
}

main().catch((err) => {
  console.error("Error truncating DB:", err);
  process.exit(1);
});
