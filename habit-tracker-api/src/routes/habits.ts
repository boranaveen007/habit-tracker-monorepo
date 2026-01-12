// src/routes/habits.ts
import { Elysia, t } from 'elysia';
import { habitController } from '../controllers/habitController';
import { authMiddleware } from '../middleware/auth';

export const habitRoutes = new Elysia({ prefix: '/habits' })
  .use(authMiddleware) // ENABLED

  // GET /habits
  .get('/', async ({ user, set }) => {
    if (!user) {
      set.status = 401;
      throw new Error('Unauthorized');
    }
    const includeArchived = false;
    return await habitController.getUserHabits(user.id, includeArchived);
  })

  // POST /habits
  .post('/', async ({ user, body, set }) => {
    if (!user) {
      set.status = 401;
      throw new Error('Unauthorized');
    }
    return await habitController.createHabit(user.id, body);
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      description: t.Optional(t.String()),
      category: t.Optional(t.String()),
      startDate: t.String(),
      endDate: t.Optional(t.String()),
    }),
  });
