import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("projects")
      .withIndex("by_user_and_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) return null;
    return project;
  },
});

export const create = mutation({
  args: { name: v.string(), description: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("projects", {
      userId,
      name: args.name,
      description: args.description,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    generatedDesign: v.optional(v.string()),
    generatedImage: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("generating"), v.literal("complete"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) throw new Error("Not found");

    const updates: Partial<typeof project> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.generatedDesign !== undefined) updates.generatedDesign = args.generatedDesign;
    if (args.generatedImage !== undefined) updates.generatedImage = args.generatedImage;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) throw new Error("Not found");

    // Delete related chat messages
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    // Delete related iterations
    const iterations = await ctx.db
      .query("designIterations")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();
    for (const iter of iterations) {
      await ctx.db.delete(iter._id);
    }

    await ctx.db.delete(args.id);
  },
});
