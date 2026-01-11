// src/middleware/auth.ts
import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authMiddleware = (app: Elysia) =>
  app
    .use(
      jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET || "your-secret-key", // Make sure this matches your .env
      })
    )
    .derive(async ({ jwt, headers: { authorization } }) => {
      // 1. Check for header
      if (!authorization?.startsWith("Bearer ")) {
        return { user: null };
      }

      // 2. Verify token
      const token = authorization.slice(7);
      const payload = await jwt.verify(token);

      // 3. Return user context if valid, otherwise null
      if (!payload) {
        return { user: null };
      }

      return {
        user: {
          id: payload.userId as string,
          email: payload.email as string,
        },
      };
    });
