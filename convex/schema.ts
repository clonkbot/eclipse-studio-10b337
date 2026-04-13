import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // App projects created by users
  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    generatedDesign: v.optional(v.string()), // AI-generated design description
    generatedImage: v.optional(v.string()), // Base64 image of the UI mockup
    status: v.union(v.literal("draft"), v.literal("generating"), v.literal("complete")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_user_and_created", ["userId", "createdAt"]),

  // Design iterations for each project
  designIterations: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    prompt: v.string(),
    designDescription: v.string(),
    imageBase64: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]).index("by_user", ["userId"]),

  // Chat messages for design refinement
  chatMessages: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),
});
