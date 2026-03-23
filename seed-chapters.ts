import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./src/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const ADMIN_ID = "admin";

const k10 = [
  "Konsep Dasar Ilmu Sejarah",
  "Kerajaan Hindu-Buddha",
  "Kerajaan Islam",
  "Penjajahan Bangsa Barat",
  "Perlawanan Rakyat Daerah",
  "Pergerakan Kebangsaan Indonesia"
];

const k11 = [
  "Pendudukan Jepang",
  "Proklamasi Kemerdekaan Indonesia",
  "Mempertahankan Kemerdekaan Indonesia",
  "Pemerintahan Sukarno",
  "Pemerintahan Suharto",
  "Reformasi"
];

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

async function main() {
  console.log("Seeding Chapters...");

  const chaptersToInsert = [
    ...k10.map((title) => ({
      slug: slugify(title),
      title,
      grade: "Kelas 10",
      content: JSON.stringify({ theory: "# " + title + "\n\nKonten sedang dikurasi.", artifacts: [] }),
      authorId: ADMIN_ID,
      status: "Draft", // Required by prompt
    })),
    ...k11.map((title) => ({
      slug: slugify(title),
      title,
      grade: "Kelas 11",
      content: JSON.stringify({ theory: "# " + title + "\n\nKonten sedang dikurasi.", artifacts: [] }),
      authorId: ADMIN_ID,
      status: "Draft", // Required by prompt
    })),
  ];

  for (const chapter of chaptersToInsert) {
      await db.insert(schema.chapters).values(chapter).onConflictDoNothing({
          target: schema.chapters.slug
      });
  }

  console.log("Chapters Seeded Successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
