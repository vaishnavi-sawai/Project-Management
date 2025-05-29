import { z } from "zod";
import { protectedProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return users;
  }),
  createUser: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const user = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
        },
      });

      return { id: user.id, email: user.email };
    }),
});
