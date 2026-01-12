// src/routes/logs.ts
import { Elysia, t } from 'elysia';
import { logController } from '../controllers/logController';
import { authMiddleware } from '../middleware/auth';

export const logRoutes = new Elysia({ prefix: '/logs' })
  .use(authMiddleware) // ENABLED: This injects 'user' into context

  // POST /logs/toggle
  .post('/toggle', async ({ user, body, set }) => {
    if (!user) {
      set.status = 401;
      throw new Error('Unauthorized');
    }
    // Pass real user.id instead of DEV_USER_ID
    return await logController.toggleHabitLog(user.id, body);
  }, {
    body: t.Object({
      habitId: t.String(),
      date: t.String(),
      completed: t.Boolean(),
    }),
  })

  // GET /logs/range
  .get('/range', async ({ user, query, set }) => {
    if (!user) {
      set.status = 401;
      throw new Error('Unauthorized');
    }
    return await logController.getLogsForDateRange(
      user.id,
      query.startDate,
      query.endDate
    );
  }, {
    query: t.Object({
      startDate: t.String(),
      endDate: t.String()
    })
  })

  // GET /logs/monthly
  .get('/monthly', async ({ user, query, set }) => {
    if (!user) {
      set.status = 401;
      throw new Error('Unauthorized');
    }
    const year = parseInt(query.year);
    const month = parseInt(query.month);
    
    if (isNaN(year) || isNaN(month)) {
      set.status = 400;
      throw new Error('Invalid year or month');
    }
    
    return await logController.getMonthlyStats(user.id, year, month);
  }, {
    query: t.Object({
      year: t.String(),
      month: t.String()
    })
  });
