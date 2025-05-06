import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDealSchema, insertTagSchema, insertBusinessUnitSchema, insertCommentSchema, insertResourceSchema, insertCustomFieldSchema } from "@shared/schema";
import { z } from "zod";
import { generateDealSummary, generateMarketResearch } from "./openai";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Error handling middleware
  const handleError = (err: any, res: Response) => {
    console.error(err);
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      return res.status(400).json({ message: validationError.message });
    }
    return res.status(500).json({ message: err.message || "Internal Server Error" });
  };

  // === Users Routes ===
  app.get("/api/users", async (_req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (err) {
      handleError(err, res);
    }
  });

  // === Business Units Routes ===
  app.get("/api/business-units", async (_req: Request, res: Response) => {
    try {
      const businessUnits = await storage.getBusinessUnits();
      res.json(businessUnits);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/business-units", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBusinessUnitSchema.parse(req.body);
      const businessUnit = await storage.createBusinessUnit(validatedData);
      res.status(201).json(businessUnit);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.put("/api/business-units/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBusinessUnitSchema.partial().parse(req.body);
      const businessUnit = await storage.updateBusinessUnit(id, validatedData);
      
      if (!businessUnit) {
        return res.status(404).json({ message: "Business unit not found" });
      }
      
      res.json(businessUnit);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/business-units/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBusinessUnit(id);
      
      if (!success) {
        return res.status(404).json({ message: "Business unit not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // === Tags Routes ===
  app.get("/api/tags", async (_req: Request, res: Response) => {
    try {
      const tags = await storage.getTags();
      res.json(tags);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/tags", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTagSchema.parse(req.body);
      const tag = await storage.createTag(validatedData);
      res.status(201).json(tag);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.put("/api/tags/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTagSchema.partial().parse(req.body);
      const tag = await storage.updateTag(id, validatedData);
      
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      res.json(tag);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/tags/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTag(id);
      
      if (!success) {
        return res.status(404).json({ message: "Tag not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // === Custom Fields Routes ===
  app.get("/api/custom-fields", async (_req: Request, res: Response) => {
    try {
      const customFields = await storage.getCustomFields();
      res.json(customFields);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/custom-fields", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCustomFieldSchema.parse(req.body);
      const customField = await storage.createCustomField(validatedData);
      res.status(201).json(customField);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.put("/api/custom-fields/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomFieldSchema.partial().parse(req.body);
      const customField = await storage.updateCustomField(id, validatedData);
      
      if (!customField) {
        return res.status(404).json({ message: "Custom field not found" });
      }
      
      res.json(customField);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/custom-fields/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCustomField(id);
      
      if (!success) {
        return res.status(404).json({ message: "Custom field not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // === Deals Routes ===
  app.get("/api/deals", async (req: Request, res: Response) => {
    try {
      const filters = {
        leadOwnerId: req.query.leadOwnerId ? parseInt(req.query.leadOwnerId as string) : undefined,
        businessUnitId: req.query.businessUnitId ? parseInt(req.query.businessUnitId as string) : undefined,
        stage: req.query.stage as string | undefined,
        dealType: req.query.dealType as string | undefined,
        search: req.query.search as string | undefined,
      };
      
      const deals = await storage.getDeals(filters);
      res.json(deals);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get("/api/deals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deal = await storage.getDeal(id);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      res.json(deal);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/deals", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(validatedData);
      
      // Add tags if provided
      if (req.body.tagIds && Array.isArray(req.body.tagIds)) {
        for (const tagId of req.body.tagIds) {
          await storage.addTagToDeal(deal.id, tagId);
        }
      }
      
      // Log activity
      if (req.body.userId) {
        await storage.logActivity({
          dealId: deal.id,
          userId: req.body.userId,
          action: "Created deal",
          details: { deal: validatedData }
        });
      }
      
      // Generate AI summary if notes are provided
      if (validatedData.notes) {
        const businessUnit = validatedData.businessUnitId 
          ? await storage.getBusinessUnit(validatedData.businessUnitId)
          : undefined;
        
        const tags = req.body.tagIds && Array.isArray(req.body.tagIds)
          ? await Promise.all(req.body.tagIds.map(id => storage.getTag(id)))
          : [];
        
        const filteredTags = tags.filter(Boolean).map(tag => tag!.name);

        const aiSummary = await generateDealSummary({
          company: validatedData.company,
          website: validatedData.website,
          internalContact: validatedData.internalContact,
          businessUnit: businessUnit?.name,
          dealType: validatedData.dealType,
          investmentSize: validatedData.investmentSize,
          useCase: validatedData.useCase,
          notes: validatedData.notes,
          tags: filteredTags
        });
        
        await storage.updateDeal(deal.id, { aiSummary });
        deal.aiSummary = aiSummary;
      }
      
      res.status(201).json(deal);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.put("/api/deals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDealSchema.partial().parse(req.body);
      const deal = await storage.updateDeal(id, validatedData);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      // Update tags if provided
      if (req.body.tagIds && Array.isArray(req.body.tagIds)) {
        // Get current tags
        const currentTags = await storage.getDealTags(id);
        const currentTagIds = currentTags.map(tag => tag.id);
        
        // Remove tags that are no longer in the list
        for (const tagId of currentTagIds) {
          if (!req.body.tagIds.includes(tagId)) {
            await storage.removeTagFromDeal(id, tagId);
          }
        }
        
        // Add new tags
        for (const tagId of req.body.tagIds) {
          if (!currentTagIds.includes(tagId)) {
            await storage.addTagToDeal(id, tagId);
          }
        }
      }
      
      // Log activity
      if (req.body.userId) {
        await storage.logActivity({
          dealId: deal.id,
          userId: req.body.userId,
          action: "Updated deal",
          details: { changes: validatedData }
        });
      }
      
      // Regenerate AI summary if notes or other key fields are updated
      if (validatedData.notes || validatedData.company || validatedData.dealType || validatedData.useCase || validatedData.businessUnitId) {
        const updatedDeal = await storage.getDeal(id);
        if (updatedDeal) {
          const tags = updatedDeal.tags?.map(tag => tag.name) || [];
          
          const aiSummary = await generateDealSummary({
            company: updatedDeal.company,
            website: updatedDeal.website,
            internalContact: updatedDeal.internalContact,
            businessUnit: updatedDeal.businessUnit?.name,
            dealType: updatedDeal.dealType,
            investmentSize: updatedDeal.investmentSize,
            useCase: updatedDeal.useCase,
            notes: updatedDeal.notes,
            tags: tags
          });
          
          await storage.updateDeal(id, { aiSummary });
          deal.aiSummary = aiSummary;
        }
      }
      
      res.json(deal);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/deals/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDeal(id);
      
      if (!success) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      // Log activity
      if (req.body.userId) {
        await storage.logActivity({
          dealId: id,
          userId: req.body.userId,
          action: "Deleted deal",
          details: { dealId: id }
        });
      }
      
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // === Deal Tags Routes ===
  app.post("/api/deals/:dealId/tags/:tagId", async (req: Request, res: Response) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const tagId = parseInt(req.params.tagId);
      
      const dealTag = await storage.addTagToDeal(dealId, tagId);
      res.status(201).json(dealTag);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/deals/:dealId/tags/:tagId", async (req: Request, res: Response) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const tagId = parseInt(req.params.tagId);
      
      const success = await storage.removeTagFromDeal(dealId, tagId);
      
      if (!success) {
        return res.status(404).json({ message: "Deal tag not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // === Resources Routes ===
  app.get("/api/deals/:dealId/resources", async (req: Request, res: Response) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const resources = await storage.getResources(dealId);
      res.json(resources);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/deals/:dealId/resources", async (req: Request, res: Response) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const validatedData = insertResourceSchema.parse({ ...req.body, dealId });
      
      const resource = await storage.createResource(validatedData);
      
      // Log activity
      if (req.body.userId) {
        await storage.logActivity({
          dealId,
          userId: req.body.userId,
          action: "Added resource",
          details: { resource: validatedData }
        });
      }
      
      res.status(201).json(resource);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteResource(id);
      
      if (!success) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // === Comments Routes ===
  app.get("/api/deals/:dealId/comments", async (req: Request, res: Response) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const comments = await storage.getComments(dealId);
      res.json(comments);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/deals/:dealId/comments", async (req: Request, res: Response) => {
    try {
      const dealId = parseInt(req.params.dealId);
      const validatedData = insertCommentSchema.parse({ ...req.body, dealId });
      
      const comment = await storage.createComment(validatedData);
      
      // Log activity
      await storage.logActivity({
        dealId,
        userId: validatedData.userId,
        action: "Added comment",
        details: { commentId: comment.id }
      });
      
      // Update the deal's lastUpdated timestamp
      await storage.updateDeal(dealId, {});
      
      res.status(201).json(comment);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.delete("/api/comments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteComment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      res.status(204).end();
    } catch (err) {
      handleError(err, res);
    }
  });

  // === AI Generation Routes ===
  app.post("/api/deals/:id/generate-summary", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deal = await storage.getDeal(id);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      const tags = deal.tags?.map(tag => tag.name) || [];
      
      const aiSummary = await generateDealSummary({
        company: deal.company,
        website: deal.website,
        internalContact: deal.internalContact,
        businessUnit: deal.businessUnit?.name,
        dealType: deal.dealType,
        investmentSize: deal.investmentSize,
        useCase: deal.useCase,
        notes: deal.notes,
        tags: tags
      });
      
      const updatedDeal = await storage.updateDeal(id, { aiSummary });
      
      // Log activity
      if (req.body.userId) {
        await storage.logActivity({
          dealId: id,
          userId: req.body.userId,
          action: "Generated AI summary",
          details: {}
        });
      }
      
      res.json({ aiSummary });
    } catch (err) {
      handleError(err, res);
    }
  });

  app.post("/api/deals/:id/generate-market-research", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deal = await storage.getDeal(id);
      
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      const tags = deal.tags?.map(tag => tag.name) || [];
      
      const report = await generateMarketResearch({
        company: deal.company,
        website: deal.website,
        businessUnit: deal.businessUnit?.name,
        dealType: deal.dealType,
        useCase: deal.useCase,
        tags: tags,
        industry: req.body.industry
      });
      
      // Store report link (in a real implementation, we'd save the full report to a database or file storage)
      const reportLink = `Generated Market Report: ${deal.company}`;
      await storage.updateDeal(id, { aiMarketReportLink: reportLink });
      
      // Log activity
      if (req.body.userId) {
        await storage.logActivity({
          dealId: id,
          userId: req.body.userId,
          action: "Generated market research",
          details: {}
        });
      }
      
      res.json({ report });
    } catch (err) {
      handleError(err, res);
    }
  });

  // === Dashboard Stats Route ===
  app.get("/api/dashboard/stats", async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (err) {
      handleError(err, res);
    }
  });

  // === Recent Activity Route ===
  app.get("/api/activity", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activity = await storage.getRecentActivity(limit);
      res.json(activity);
    } catch (err) {
      handleError(err, res);
    }
  });

  return httpServer;
}
