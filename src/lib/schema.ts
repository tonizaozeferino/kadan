import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  date,
  unique,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const habits = pgTable("habits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  text: varchar("text", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  value: varchar("value", { length: 100 }).notNull(),
  completedDates: text("completed_dates")
    .array()
    .default([])
    .notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  text: varchar("text", { length: 255 }).notNull(),
  target: integer("target").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  progress: integer("progress").default(0).notNull(),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  project: varchar("project", { length: 50 }).notNull(),
  text: varchar("text", { length: 500 }).notNull(),
  status: varchar("status", { length: 20 }).default("backlog").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const statusEntries = pgTable(
  "status_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    project: varchar("project", { length: 50 }).notNull(),
    whatDone: text("what_done"),
    whatNext: text("what_next"),
    date: date("date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userProjectDate: unique().on(table.userId, table.project, table.date),
  })
);
