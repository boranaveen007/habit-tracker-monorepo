// src/routes/auth.ts
import { Elysia, t } from 'elysia';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

// CONSTANT for Dev/Bypass Mode
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(authMiddleware)
  .post(
    '/register',
    async ({ body, jwt }) => {
      try {
        const user = await authController.register(body);
        const token = await jwt.sign({ userId: user.id, email: user.email });

        return { user, token };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        name: t.String({ minLength: 1 }),
        password: t.String({ minLength: 6 }),
      }),
    }
  )
  .post(
    '/login',
    async ({ body, jwt }) => {
      try {
        const user = await authController.login(body);
        const token = await jwt.sign({ userId: user.id, email: user.email });

        return { user, token };
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
      }),
    }
  )
  // GET Profile (Auth Bypass Enabled)
  .get('/profile', async ({ user }) => {
    try {
      // Use logged in user OR fallback to Dev User
      const userId = user ? user.id : DEV_USER_ID;
      return await authController.getProfile(userId);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }) 
  // PATCH Profile (Auth Bypass Enabled)
  .patch('/profile', async ({ user, body }) => {
    try {
      // Use logged in user OR fallback to Dev User
      const userId = user ? user.id : DEV_USER_ID;
      return await authController.updateProfile(userId, body);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }, {
    // isAuthenticated: true, // <--- DISABLED THIS CHECK
    body: t.Object({
      settings: t.Optional(t.Object({
        theme: t.Optional(t.String()),
        defaultView: t.Optional(t.String()),
      }))
    })
  });
