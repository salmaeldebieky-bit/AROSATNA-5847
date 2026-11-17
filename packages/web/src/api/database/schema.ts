import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";
export * from "./auth-schema";

export const profiles = sqliteTable("bride_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["admin", "bride"] })
    .notNull()
    .default("bride"),
  status: text("status", {
    enum: ["pending", "under_review", "active", "rejected", "suspended"],
  })
    .notNull()
    .default("pending"),
  onboarded: integer("onboarded", { mode: "boolean" }).notNull().default(false),
  weddingDate: text("wedding_date").notNull().default("2027-05-01"),
  budget: real("budget").notNull().default(250000),
  weight: real("weight").notNull().default(68),
  targetWeight: real("target_weight").notNull().default(58),
  height: real("height").notNull().default(165),
  age: integer("age").notNull().default(25),
  activity: real("activity").notNull().default(1.375),
});
export const entries = sqliteTable("planning_entries", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  data: text("data", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
});
export const receipts = sqliteTable("payment_receipts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  sender: text("sender").notNull(),
  reference: text("reference").notNull(),
  image: text("image").notNull(),
  amount: real("amount").notNull(),
  status: text("status", { enum: ["under_review", "approved", "rejected"] })
    .notNull()
    .default("under_review"),
  note: text("note").notNull().default(""),
  submittedAt: text("submitted_at").notNull(),
  reviewedBy: text("reviewed_by"),
  reviewedAt: text("reviewed_at"),
});
export const settings = sqliteTable("platform_settings", {
  id: text("id").primaryKey(),
  data: text("data", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
});
