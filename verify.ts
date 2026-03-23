import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./src/db/schema";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  const users = await db.select().from(schema.users);
  console.log("USERS:", users.map(u => ({ id: u.id, email: u.email, role: u.role })));
  
  // Create or updated hashed password properly
  const ADMIN_PASSWORD = "Admin-ruang-waktu-2311";
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  
  await sql`UPDATE users SET email = 'admin@ruangwaktu12.id', password = ${hashedPassword} WHERE id = 'admin'`;
  console.log("UPDATED FORCEFULLY");

  const usersAfter = await db.select().from(schema.users);
  console.log("USERS AFTER:", usersAfter.map(u => ({ id: u.id, email: u.email, role: u.role })));
}

main().catch(console.error);
