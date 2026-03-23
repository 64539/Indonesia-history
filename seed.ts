import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./src/db/schema";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const ADMIN_ID = "admin";
const ADMIN_EMAIL = "admin@museum.id";
const ADMIN_NAME = "Master Admin";
const ADMIN_PASSWORD = "AdminMuseum2026!";

async function main() {
  console.log("Seeding Master Admin...");
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  
  await db.insert(schema.users).values({
    id: ADMIN_ID,
    name: ADMIN_NAME,
    email: ADMIN_EMAIL.toLowerCase(),
    password: hashedPassword,
    role: "admin",
  }).onConflictDoUpdate({
    target: schema.users.email,
    set: {
      id: ADMIN_ID,
      name: ADMIN_NAME,
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Master Admin Seeded Successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
