import { 
  users, deals, businessUnits, tags, customFields, 
  dealTags, resources, comments, activityLogs,
  type User, type InsertUser, type Deal, type InsertDeal, 
  type BusinessUnit, type InsertBusinessUnit, type Tag, type InsertTag,
  type CustomField, type InsertCustomField, type Resource, type InsertResource,
  type Comment, type InsertComment, type ActivityLog, type InsertActivityLog,
  type DealTag, type InsertDealTag, type DealWithRelations
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like, inArray, desc, sql, asc, not } from "drizzle-orm";

// Define the Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  // Business Unit operations
  getBusinessUnits(): Promise<BusinessUnit[]>;
  getBusinessUnit(id: number): Promise<BusinessUnit | undefined>;
  createBusinessUnit(businessUnit: InsertBusinessUnit): Promise<BusinessUnit>;
  updateBusinessUnit(id: number, businessUnit: Partial<InsertBusinessUnit>): Promise<BusinessUnit | undefined>;
  deleteBusinessUnit(id: number): Promise<boolean>;

  // Tag operations
  getTags(): Promise<Tag[]>;
  getTag(id: number): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag | undefined>;
  deleteTag(id: number): Promise<boolean>;

  // Custom Field operations
  getCustomFields(): Promise<CustomField[]>;
  getCustomField(id: number): Promise<CustomField | undefined>;
  createCustomField(customField: InsertCustomField): Promise<CustomField>;
  updateCustomField(id: number, customField: Partial<InsertCustomField>): Promise<CustomField | undefined>;
  deleteCustomField(id: number): Promise<boolean>;

  // Deal operations
  getDeals(filters?: {
    leadOwnerId?: number;
    businessUnitId?: number;
    stage?: string;
    dealType?: string;
    search?: string;
  }): Promise<DealWithRelations[]>;
  getDeal(id: number): Promise<DealWithRelations | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: number, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: number): Promise<boolean>;

  // DealTag operations
  addTagToDeal(dealId: number, tagId: number): Promise<DealTag>;
  removeTagFromDeal(dealId: number, tagId: number): Promise<boolean>;
  getDealTags(dealId: number): Promise<Tag[]>;

  // Resource operations
  getResources(dealId: number): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  deleteResource(id: number): Promise<boolean>;

  // Comment operations
  getComments(dealId: number): Promise<(Comment & { user: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  
  // Activity Log operations
  logActivity(activityLog: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivity(limit?: number): Promise<(ActivityLog & { deal: Deal, user: User })[]>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalDeals: number;
    activeNegotiations: number;
    totalInvestment: number;
    closedThisMonth: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Business Unit operations
  async getBusinessUnits(): Promise<BusinessUnit[]> {
    return db.select().from(businessUnits);
  }

  async getBusinessUnit(id: number): Promise<BusinessUnit | undefined> {
    const [businessUnit] = await db.select().from(businessUnits).where(eq(businessUnits.id, id));
    return businessUnit;
  }

  async createBusinessUnit(insertBusinessUnit: InsertBusinessUnit): Promise<BusinessUnit> {
    const [businessUnit] = await db.insert(businessUnits).values(insertBusinessUnit).returning();
    return businessUnit;
  }

  async updateBusinessUnit(id: number, businessUnit: Partial<InsertBusinessUnit>): Promise<BusinessUnit | undefined> {
    const [updatedBusinessUnit] = await db
      .update(businessUnits)
      .set(businessUnit)
      .where(eq(businessUnits.id, id))
      .returning();
    return updatedBusinessUnit;
  }

  async deleteBusinessUnit(id: number): Promise<boolean> {
    const result = await db.delete(businessUnits).where(eq(businessUnits.id, id)).returning({ id: businessUnits.id });
    return result.length > 0;
  }

  // Tag operations
  async getTags(): Promise<Tag[]> {
    return db.select().from(tags);
  }

  async getTag(id: number): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag;
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const [tag] = await db.insert(tags).values(insertTag).returning();
    return tag;
  }

  async updateTag(id: number, tag: Partial<InsertTag>): Promise<Tag | undefined> {
    const [updatedTag] = await db
      .update(tags)
      .set(tag)
      .where(eq(tags.id, id))
      .returning();
    return updatedTag;
  }

  async deleteTag(id: number): Promise<boolean> {
    const result = await db.delete(tags).where(eq(tags.id, id)).returning({ id: tags.id });
    return result.length > 0;
  }

  // Custom Field operations
  async getCustomFields(): Promise<CustomField[]> {
    return db.select().from(customFields);
  }

  async getCustomField(id: number): Promise<CustomField | undefined> {
    const [customField] = await db.select().from(customFields).where(eq(customFields.id, id));
    return customField;
  }

  async createCustomField(insertCustomField: InsertCustomField): Promise<CustomField> {
    const [customField] = await db.insert(customFields).values(insertCustomField).returning();
    return customField;
  }

  async updateCustomField(id: number, customField: Partial<InsertCustomField>): Promise<CustomField | undefined> {
    const [updatedCustomField] = await db
      .update(customFields)
      .set(customField)
      .where(eq(customFields.id, id))
      .returning();
    return updatedCustomField;
  }

  async deleteCustomField(id: number): Promise<boolean> {
    const result = await db.delete(customFields).where(eq(customFields.id, id)).returning({ id: customFields.id });
    return result.length > 0;
  }

  // Deal operations
  async getDeals(filters?: {
    leadOwnerId?: number;
    businessUnitId?: number;
    stage?: string;
    dealType?: string;
    search?: string;
  }): Promise<DealWithRelations[]> {
    let query = db
      .select({
        deal: deals,
        businessUnit: businessUnits,
        leadOwner: users,
      })
      .from(deals)
      .leftJoin(businessUnits, eq(deals.businessUnitId, businessUnits.id))
      .leftJoin(users, eq(deals.leadOwnerId, users.id));

    // Build the conditions array for the where clause
    const conditions: any[] = [];
    
    if (filters) {
      if (filters.leadOwnerId) {
        conditions.push(eq(deals.leadOwnerId, filters.leadOwnerId));
      }
      if (filters.businessUnitId) {
        conditions.push(eq(deals.businessUnitId, filters.businessUnitId));
      }
      if (filters.stage) {
        if (filters.stage === 'active') {
          // Active deals are all deals except Closed Won and Closed Lost
          conditions.push(
            not(inArray(deals.stage, ['Closed Won', 'Closed Lost']))
          );
        } else if (filters.stage === 'closed') {
          // Closed deals are either Closed Won or Closed Lost
          conditions.push(
            inArray(deals.stage, ['Closed Won', 'Closed Lost'])
          );
        } else {
          // Specific stage filter
          conditions.push(eq(deals.stage, filters.stage));
        }
      }
      if (filters.dealType) {
        conditions.push(eq(deals.dealType, filters.dealType));
      }
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        // Search across multiple columns: company, stage, deal type, and notes
        conditions.push(
          or(
            like(deals.company, searchTerm),
            like(deals.stage, searchTerm),
            like(deals.dealType, searchTerm),
            like(deals.notes || '', searchTerm),
            like(deals.useCase || '', searchTerm),
            like(deals.internalContact || '', searchTerm)
          )
        );
      }
    }
    
    // Apply all conditions together
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const dealsWithRelations = await query.orderBy(desc(deals.lastUpdated));

    // Get tags for each deal
    const enhancedDeals = await Promise.all(
      dealsWithRelations.map(async (deal) => {
        const dealTagList = await this.getDealTags(deal.deal.id);
        const resources = await this.getResources(deal.deal.id);
        
        return {
          ...deal.deal,
          businessUnit: deal.businessUnit || undefined,
          leadOwner: deal.leadOwner || undefined,
          tags: dealTagList,
          resources,
        };
      })
    );

    return enhancedDeals;
  }

  async getDeal(id: number): Promise<DealWithRelations | undefined> {
    const [dealWithRelations] = await db
      .select({
        deal: deals,
        businessUnit: businessUnits,
        leadOwner: users,
      })
      .from(deals)
      .where(eq(deals.id, id))
      .leftJoin(businessUnits, eq(deals.businessUnitId, businessUnits.id))
      .leftJoin(users, eq(deals.leadOwnerId, users.id));

    if (!dealWithRelations) return undefined;

    const dealTags = await this.getDealTags(id);
    const resources = await this.getResources(id);
    const comments = await this.getComments(id);

    return {
      ...dealWithRelations.deal,
      businessUnit: dealWithRelations.businessUnit || undefined,
      leadOwner: dealWithRelations.leadOwner || undefined,
      tags: dealTags,
      resources,
      comments,
    };
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const [deal] = await db
      .insert(deals)
      .values({ ...insertDeal, lastUpdated: new Date() })
      .returning();
    return deal;
  }

  async updateDeal(id: number, deal: Partial<InsertDeal>): Promise<Deal | undefined> {
    const [updatedDeal] = await db
      .update(deals)
      .set({ ...deal, lastUpdated: new Date() })
      .where(eq(deals.id, id))
      .returning();
    return updatedDeal;
  }

  async deleteDeal(id: number): Promise<boolean> {
    const result = await db.delete(deals).where(eq(deals.id, id)).returning({ id: deals.id });
    return result.length > 0;
  }

  // DealTag operations
  async addTagToDeal(dealId: number, tagId: number): Promise<DealTag> {
    const [dealTag] = await db
      .insert(dealTags)
      .values({ dealId, tagId })
      .returning();
    return dealTag;
  }

  async removeTagFromDeal(dealId: number, tagId: number): Promise<boolean> {
    const result = await db
      .delete(dealTags)
      .where(and(eq(dealTags.dealId, dealId), eq(dealTags.tagId, tagId)))
      .returning({ id: dealTags.id });
    return result.length > 0;
  }

  async getDealTags(dealId: number): Promise<Tag[]> {
    const results = await db
      .select({ tag: tags })
      .from(dealTags)
      .where(eq(dealTags.dealId, dealId))
      .innerJoin(tags, eq(dealTags.tagId, tags.id));
    
    return results.map(r => r.tag);
  }

  // Resource operations
  async getResources(dealId: number): Promise<Resource[]> {
    return db
      .select()
      .from(resources)
      .where(eq(resources.dealId, dealId));
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db
      .insert(resources)
      .values(insertResource)
      .returning();
    return resource;
  }

  async deleteResource(id: number): Promise<boolean> {
    const result = await db
      .delete(resources)
      .where(eq(resources.id, id))
      .returning({ id: resources.id });
    return result.length > 0;
  }

  // Comment operations
  async getComments(dealId: number): Promise<(Comment & { user: User })[]> {
    const results = await db
      .select({ comment: comments, user: users })
      .from(comments)
      .where(eq(comments.dealId, dealId))
      .innerJoin(users, eq(comments.userId, users.id))
      .orderBy(desc(comments.createdAt));
    
    return results.map(r => ({ ...r.comment, user: r.user }));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning({ id: comments.id });
    return result.length > 0;
  }

  // Activity Log operations
  async logActivity(insertActivityLog: InsertActivityLog): Promise<ActivityLog> {
    const [activityLog] = await db
      .insert(activityLogs)
      .values(insertActivityLog)
      .returning();
    return activityLog;
  }

  async getRecentActivity(limit: number = 10): Promise<(ActivityLog & { deal: Deal, user: User })[]> {
    const results = await db
      .select({ activity: activityLogs, deal: deals, user: users })
      .from(activityLogs)
      .innerJoin(deals, eq(activityLogs.dealId, deals.id))
      .innerJoin(users, eq(activityLogs.userId, users.id))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
    
    return results.map(r => ({ ...r.activity, deal: r.deal, user: r.user }));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalDeals: number;
    activeNegotiations: number;
    totalInvestment: number;
    closedThisMonth: number;
  }> {
    // Get total deals count
    const [totalDealsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(deals);
    
    // Get active negotiations count
    const [activeNegotiationsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(deals)
      .where(eq(deals.stage, 'Negotiation'));
    
    // Get total investment
    const [totalInvestmentResult] = await db
      .select({ sum: sql<number>`sum(${deals.investmentSize})` })
      .from(deals)
      .where(sql`${deals.investmentSize} is not null`);
    
    // Get deals closed this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [closedThisMonthResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(deals)
      .where(
        and(
          eq(deals.stage, 'Closed Won'),
          sql`${deals.lastUpdated} >= ${firstDayOfMonth.toISOString()}`
        )
      );
    
    return {
      totalDeals: totalDealsResult?.count || 0,
      activeNegotiations: activeNegotiationsResult?.count || 0,
      totalInvestment: totalInvestmentResult?.sum || 0,
      closedThisMonth: closedThisMonthResult?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
