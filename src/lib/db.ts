import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

let db: ReturnType<typeof drizzle>;
let sqlConn: ReturnType<typeof neon> | null = null;

if (databaseUrl) {
  let finalUrl = databaseUrl;
  try {
    const u = new URL(databaseUrl);
    if (!u.searchParams.get("sslmode")) {
      u.searchParams.set("sslmode", "require");
    }
    finalUrl = u.toString();
  } catch {}
  sqlConn = neon(finalUrl);
  db = drizzle(sqlConn, { schema });
} else {
  db = new Proxy({} as unknown as ReturnType<typeof drizzle>, {
    get: () => {
      throw new Error("DATABASE_URL is not defined");
    },
  });
}

export { db };
export async function testDbConnection() {
  if (!sqlConn) {
    throw new Error("DATABASE_URL is not defined");
  }
  const rows = await sqlConn`select 1 as ok`;
  return Array.isArray(rows) && rows.length > 0;
}
