import { Elysia, t } from 'elysia';
import { habitController } from '../controllers/habitController';

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001'; // temporary

export const habitRoutes = new Elysia({ prefix: '/habits' })
  // .use(authMiddleware) // disable for now

  .get(
    '/',
    async () => {
      console.log('GET /habits handler called (dev, no auth)');
      const includeArchived = false;
      return await habitController.getUserHabits(DEV_USER_ID, includeArchived);
    },
  )

  .post(
    '/',
    async (ctx) => {
      console.log('POST /habits handler called (dev, no auth)');
      const { body } = ctx as any;
      return await habitController.createHabit(DEV_USER_ID, body);
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        category: t.Optional(t.String()),
        startDate: t.String(),
        endDate: t.Optional(t.String()),
      }),
    },
  );
