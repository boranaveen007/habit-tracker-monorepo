// src/routes/auth.ts
import { Elysia, t } from 'elysia';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(authMiddleware)
  
  // PUBLIC: Register
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
  
  // PUBLIC: Login
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

  // PROTECTED: Get Profile
  .get('/profile', async ({ user, set }) => {
    try {
      if (!user) {
        set.status = 401;
        throw new Error('Unauthorized');
      }
      return await authController.getProfile(user.id);
    } catch (error: any) {
      if (!set.status) set.status = 500;
      throw new Error(error.message);
    }
  })

  // PROTECTED: Update Profile (Settings)
  .patch('/profile', async ({ user, body, set }) => {
    try {
      if (!user) {
        set.status = 401;
        throw new Error('Unauthorized');
      }
      return await authController.updateProfile(user.id, body);
    } catch (error: any) {
      if (!set.status) set.status = 500;
      throw new Error(error.message);
    }
  }, {
    body: t.Object({
      settings: t.Optional(t.Object({
        theme: t.Optional(t.String()),
        defaultView: t.Optional(t.String()),
      }))
    })
  });
