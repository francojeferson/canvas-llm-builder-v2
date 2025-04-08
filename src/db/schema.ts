import {
  pgTable,
  serial,
  text,
  json,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  globalPrompt: text("global_prompt").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const states = pgTable("states", {
  id: serial("id").primaryKey(),
  agentId: serial("agent_id").references(() => agents.id),
  name: text("name").notNull(),
  prompt: text("prompt").notNull(),
  position: json("position").notNull(),
  isStart: boolean("is_start").default(false),
  isEnd: boolean("is_end").default(false),
});

export const edges = pgTable("edges", {
  id: serial("id").primaryKey(),
  agentId: serial("agent_id").references(() => agents.id),
  sourceId: serial("source_id").references(() => states.id),
  targetId: serial("target_id").references(() => states.id),
  condition: text("condition"),
});
