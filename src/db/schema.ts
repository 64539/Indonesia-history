import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Using text for potential UUID or Auth provider ID
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").default("student").notNull(), // 'student', 'teacher', 'admin'
  password: text("password"), // Add password for credential auth
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  grade: text("grade").notNull(), // 'Kelas 10', 'Kelas 11', 'Kelas 12'
  content: text("content").notNull(), // Markdown content
  videoUrl: text("video_url"),
  estimatedTime: integer("estimated_time").default(10), // in minutes
  authorId: text("author_id").references(() => users.id),
  status: text("status").default("Draft").notNull(), // 'Draft', 'Published'
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timelines = pgTable("timelines", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id")
    .notNull()
    .references(() => chapters.id, { onDelete: "cascade" }),
  year: text("year").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  chapterSlug: text("chapter_slug").notNull(),
  isCompleted: boolean("is_completed").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quizScores = pgTable("quiz_scores", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  chapterSlug: text("chapter_slug").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
