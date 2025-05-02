import { db } from "../server/db";
import { 
  users, 
  businessUnits, 
  tags, 
  deals, 
  dealTags, 
  resources, 
  comments, 
  activityLogs 
} from "../shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  // Insert users
  console.log("Adding users...");
  const [user1] = await db.insert(users).values({
    username: "jsmith",
    password: "password123", // In a real app, this would be hashed
    fullName: "John Smith",
    email: "jsmith@company.com",
    role: "bizdev",
    avatarUrl: "https://ui-avatars.com/api/?name=John+Smith&background=0747A6&color=fff"
  }).returning();

  const [user2] = await db.insert(users).values({
    username: "mlee",
    password: "password123",
    fullName: "Michelle Lee",
    email: "mlee@company.com",
    role: "lead",
    avatarUrl: "https://ui-avatars.com/api/?name=Michelle+Lee&background=36B37E&color=fff"
  }).returning();

  const [user3] = await db.insert(users).values({
    username: "agarcia",
    password: "password123",
    fullName: "Alex Garcia",
    email: "agarcia@company.com",
    role: "executive",
    avatarUrl: "https://ui-avatars.com/api/?name=Alex+Garcia&background=253858&color=fff"
  }).returning();

  console.log("Added users:", user1.id, user2.id, user3.id);

  // Insert business units
  console.log("Adding business units...");
  const [unit1] = await db.insert(businessUnits).values({
    name: "Enterprise Solutions",
    color: "#0747A6"
  }).returning();

  const [unit2] = await db.insert(businessUnits).values({
    name: "Growth & Startups",
    color: "#36B37E"
  }).returning();

  const [unit3] = await db.insert(businessUnits).values({
    name: "Strategic Partnerships",
    color: "#FFC400"
  }).returning();

  console.log("Added business units:", unit1.id, unit2.id, unit3.id);

  // Insert tags
  console.log("Adding tags...");
  const [tag1] = await db.insert(tags).values({ name: "High Priority" }).returning();
  const [tag2] = await db.insert(tags).values({ name: "Healthcare" }).returning();
  const [tag3] = await db.insert(tags).values({ name: "Enterprise" }).returning();
  const [tag4] = await db.insert(tags).values({ name: "Startup" }).returning();
  const [tag5] = await db.insert(tags).values({ name: "International" }).returning();

  console.log("Added tags:", tag1.id, tag2.id, tag3.id, tag4.id, tag5.id);

  // Insert deals
  console.log("Adding deals...");
  const [deal1] = await db.insert(deals).values({
    company: "Acme Health Systems",
    website: "https://acmehealth.example.com",
    internalContact: "Sarah Jones",
    businessUnitId: unit1.id,
    dealType: "Partnership",
    investmentSize: 250000,
    useCase: "Implementing our platform across their hospital network",
    leadOwnerId: user1.id,
    stage: "Negotiation",
    notes: "Currently finalizing terms of the partnership agreement. They are looking to deploy to 5 hospitals initially with potential expansion to their entire network of 23 facilities.",
    lastUpdated: new Date(),
    customFieldValues: {}
  }).returning();

  const [deal2] = await db.insert(deals).values({
    company: "TechStart Innovation",
    website: "https://techstart.example.com",
    internalContact: "David Wilson",
    businessUnitId: unit2.id,
    dealType: "Investment",
    investmentSize: 150000,
    useCase: "Series A funding for AI-driven analytics platform",
    leadOwnerId: user2.id,
    stage: "Initial Contact",
    notes: "Promising early-stage startup with novel approach to predictive analytics. First meeting scheduled for next week.",
    lastUpdated: new Date(),
    customFieldValues: {}
  }).returning();

  const [deal3] = await db.insert(deals).values({
    company: "Global Logistics Corp",
    website: "https://globallogistics.example.com",
    internalContact: "Robert Chen",
    businessUnitId: unit3.id,
    dealType: "Partnership",
    investmentSize: 500000,
    useCase: "Joint venture for supply chain optimization",
    leadOwnerId: user3.id,
    stage: "Proposal",
    notes: "Presented initial proposal last week. They are interested in our technology for optimizing their international shipping routes.",
    lastUpdated: new Date(),
    customFieldValues: {}
  }).returning();

  const [deal4] = await db.insert(deals).values({
    company: "MediTech Solutions",
    website: "https://meditech.example.com",
    internalContact: "Karen Patel",
    businessUnitId: unit1.id,
    dealType: "Partnership",
    investmentSize: 350000,
    useCase: "Integration of medical devices with our platform",
    leadOwnerId: user1.id,
    stage: "Due Diligence",
    notes: "Technical teams are evaluating integration possibilities. Initial tests are positive.",
    lastUpdated: new Date(),
    customFieldValues: {}
  }).returning();

  const [deal5] = await db.insert(deals).values({
    company: "InnovateCo",
    website: "https://innovate.example.com",
    internalContact: "Lisa Wong",
    businessUnitId: unit2.id,
    dealType: "Investment",
    investmentSize: 75000,
    useCase: "Seed funding for consumer app development",
    leadOwnerId: user2.id,
    stage: "Closed Won",
    notes: "Agreement signed last month. Initial funding provided. Regular check-ins scheduled.",
    lastUpdated: new Date(),
    customFieldValues: {}
  }).returning();

  console.log("Added deals:", deal1.id, deal2.id, deal3.id, deal4.id, deal5.id);

  // Add tags to deals
  console.log("Adding tags to deals...");
  await db.insert(dealTags).values({ dealId: deal1.id, tagId: tag2.id });
  await db.insert(dealTags).values({ dealId: deal1.id, tagId: tag3.id });
  await db.insert(dealTags).values({ dealId: deal2.id, tagId: tag4.id });
  await db.insert(dealTags).values({ dealId: deal3.id, tagId: tag1.id });
  await db.insert(dealTags).values({ dealId: deal3.id, tagId: tag5.id });
  await db.insert(dealTags).values({ dealId: deal4.id, tagId: tag2.id });
  await db.insert(dealTags).values({ dealId: deal5.id, tagId: tag4.id });

  console.log("Added deal tags");

  // Add resources
  console.log("Adding resources...");
  await db.insert(resources).values({
    dealId: deal1.id,
    name: "Partnership Agreement",
    url: "https://documents.example.com/partnership-123",
    type: "link"
  });

  await db.insert(resources).values({
    dealId: deal1.id,
    name: "Technical Requirements",
    url: "https://documents.example.com/tech-specs-123",
    type: "link"
  });

  await db.insert(resources).values({
    dealId: deal3.id,
    name: "Joint Venture Proposal",
    url: "https://documents.example.com/proposal-456",
    type: "link"
  });

  console.log("Added resources");

  // Add comments
  console.log("Adding comments...");
  await db.insert(comments).values({
    dealId: deal1.id,
    userId: user1.id,
    content: "Had a great meeting with their CTO today. They're excited about the integration possibilities."
  });

  await db.insert(comments).values({
    dealId: deal1.id,
    userId: user2.id,
    content: "Legal has reviewed the initial terms and has a few questions about data security."
  });

  await db.insert(comments).values({
    dealId: deal3.id,
    userId: user3.id,
    content: "Their executive team is visiting our office next month for a demo."
  });

  console.log("Added comments");

  // Add activity logs
  console.log("Adding activity logs...");
  await db.insert(activityLogs).values({
    dealId: deal1.id,
    userId: user1.id,
    action: "Stage Changed",
    details: { from: "Proposal", to: "Negotiation" }
  });

  await db.insert(activityLogs).values({
    dealId: deal2.id,
    userId: user2.id,
    action: "Deal Created",
    details: { company: "TechStart Innovation" }
  });

  await db.insert(activityLogs).values({
    dealId: deal5.id,
    userId: user2.id,
    action: "Deal Closed",
    details: { amount: "$75,000" }
  });

  console.log("Added activity logs");

  console.log("Database seeding completed!");
}

seedDatabase()
  .then(() => {
    console.log("Seed script completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding database:", err);
    process.exit(1);
  });