import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) return [];

    return await ctx.db
      .query("designIterations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    prompt: v.string(),
    designDescription: v.string(),
    imageBase64: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) throw new Error("Not found");

    return await ctx.db.insert("designIterations", {
      projectId: args.projectId,
      userId,
      prompt: args.prompt,
      designDescription: args.designDescription,
      imageBase64: args.imageBase64,
      createdAt: Date.now(),
    });
  },
});
