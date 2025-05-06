import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("bizdev"), // bizdev, lead, executive, admin
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  deals: many(deals),
  comments: many(comments),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Business Units table
export const businessUnits = pgTable("business_units", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
});

export const businessUnitsRelations = relations(businessUnits, ({ many }) => ({
  deals: many(deals),
}));

export const insertBusinessUnitSchema = createInsertSchema(businessUnits).omit({
  id: true,
});

// Tags table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  dealTags: many(dealTags),
}));

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
});

// Custom fields table
export const customFields = pgTable("custom_fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type").notNull(), // text, number, enum
  required: boolean("required").default(false),
  options: jsonb("options"), // For enum type, store options array
});

export const insertCustomFieldSchema = createInsertSchema(customFields).omit({
  id: true,
});

// Main deals table
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  website: text("website"),
  internalContact: text("internal_contact"),
  businessUnitId: integer("business_unit_id").references(() => businessUnits.id),
  dealType: text("deal_type").notNull(),
  investmentSize: integer("investment_size"),
  useCase: text("use_case"),
  leadOwnerId: integer("lead_owner_id").references(() => users.id),
  stage: text("stage").notNull().default("Following"),
  notes: text("notes"),
  aiSummary: text("ai_summary"),
  aiMarketReportLink: text("ai_market_report_link"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  customFieldValues: jsonb("custom_field_values"), // Store custom field values as JSON
});

export const dealsRelations = relations(deals, ({ one, many }) => ({
  businessUnit: one(businessUnits, {
    fields: [deals.businessUnitId],
    references: [businessUnits.id],
  }),
  leadOwner: one(users, {
    fields: [deals.leadOwnerId],
    references: [users.id],
  }),
  dealTags: many(dealTags),
  resources: many(resources),
  comments: many(comments),
}));

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

// Deal Tags junction table
export const dealTags = pgTable("deal_tags", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
});

export const dealTagsRelations = relations(dealTags, ({ one }) => ({
  deal: one(deals, {
    fields: [dealTags.dealId],
    references: [deals.id],
  }),
  tag: one(tags, {
    fields: [dealTags.tagId],
    references: [tags.id],
  }),
}));

export const insertDealTagSchema = createInsertSchema(dealTags).omit({
  id: true,
});

// Resources table
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // file, link
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resourcesRelations = relations(resources, ({ one }) => ({
  deal: one(deals, {
    fields: [resources.dealId],
    references: [deals.id],
  }),
}));

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  deal: one(deals, {
    fields: [comments.dealId],
    references: [deals.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

// Activity Log table
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  dealId: integer("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  deal: one(deals, {
    fields: [activityLogs.dealId],
    references: [deals.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

// Type definitions for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BusinessUnit = typeof businessUnits.$inferSelect;
export type InsertBusinessUnit = z.infer<typeof insertBusinessUnitSchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type CustomField = typeof customFields.$inferSelect;
export type InsertCustomField = z.infer<typeof insertCustomFieldSchema>;

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;

export type DealTag = typeof dealTags.$inferSelect;
export type InsertDealTag = z.infer<typeof insertDealTagSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Extended types with relations for frontend use
export type DealWithRelations = Deal & {
  businessUnit?: BusinessUnit;
  leadOwner?: User;
  tags?: Tag[];
  resources?: Resource[];
  comments?: (Comment & { user: User })[];
};
