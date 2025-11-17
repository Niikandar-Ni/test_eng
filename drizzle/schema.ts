import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "teacher", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Student profile table - extends users table with grade level and approval status
 */
export const studentProfiles = mysqlTable("studentProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  gradeLevel: mysqlEnum("gradeLevel", ["m1", "m2", "m3", "m4", "m5", "m6"]).notNull(),
  isApproved: boolean("isApproved").default(false).notNull(),
  approvedBy: int("approvedBy"), // Teacher ID who approved
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = typeof studentProfiles.$inferInsert;

/**
 * English sentences table - contains sentences for different grade levels
 */
export const sentences = mysqlTable("sentences", {
  id: int("id").autoincrement().primaryKey(),
  gradeLevel: mysqlEnum("gradeLevel", ["m1", "m2", "m3", "m4", "m5", "m6"]).notNull(),
  englishText: text("englishText").notNull(),
  thaiMeaning: text("thaiMeaning").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sentence = typeof sentences.$inferSelect;
export type InsertSentence = typeof sentences.$inferInsert;

/**
 * Student scores table - records each attempt and score
 */
export const studentScores = mysqlTable("studentScores", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  sentenceId: int("sentenceId").notNull(),
  score: int("score").notNull(), // 0-100
  feedback: text("feedback"), // Thai feedback from Manus API
  audioUrl: varchar("audioUrl", { length: 500 }),
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudentScore = typeof studentScores.$inferSelect;
export type InsertStudentScore = typeof studentScores.$inferInsert;

/**
 * Play session tracking - tracks daily play sessions
 */
export const playSessions = mysqlTable("playSessions", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  sessionDate: varchar("sessionDate", { length: 10 }).notNull(), // YYYY-MM-DD format
  sessionNumber: int("sessionNumber").notNull(), // 1 or 2 for daily limit
  sentenceIds: text("sentenceIds").notNull(), // JSON array of sentence IDs
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlaySession = typeof playSessions.$inferSelect;
export type InsertPlaySession = typeof playSessions.$inferInsert;