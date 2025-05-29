import { z } from "zod";
import { protectedProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const dashboardRouter = createTRPCRouter({
  fetchProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.prisma.project.findMany({
      where: {
        OR: [
          {
            createdById: ctx.session.user.id,
          },
          {
            tasks: {
              some: {
                assignedToId: ctx.session.user.id,
              },
            },
          },
        ],
      },
      include: {
        tasks: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return projects;
  }),

  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Project name is required"),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const project = await ctx.prisma.project.create({
        data: {
          name: input.name,
          description: input.description || "",
          createdBy: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
      return project;
    }),

  createTask: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().min(1, "Task title is required"),
        description: z.string().optional(),
        status: z
          .enum(["TODO", "IN_PROGRESS", "DONE"])
          .optional()
          .default("TODO"),
        priority: z
          .enum(["LOW", "MEDIUM", "HIGH"])
          .optional()
          .default("MEDIUM"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const task = await ctx.prisma.task.create({
        data: {
          title: input.title,
          description: input.description || "",
          status: input.status,
          project: {
            connect: {
              id: input.projectId,
            },
          },
          createdBy: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          priority: input.priority,
        },
      });
      return task;
    }),

  updateTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        assignedToId: z.string().optional(),
        status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const task = await ctx.prisma.task.update({
        where: { id: input.taskId },
        data: {
          ...(input.title !== undefined && { title: input.title }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.assignedToId !== undefined && {
            assignedToId: input.assignedToId,
          }),
          ...(input.status !== undefined && {
            status: input.status,
          }),
          ...(input.priority !== undefined && {
            priority: input.priority,
          }),
        },
      });
      return task;
    }),

  deleteTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const task = await ctx.prisma.task.delete({
        where: { id: input.taskId },
      });
      return task;
    }),
});
