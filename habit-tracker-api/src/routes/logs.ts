// src/routes/logs.ts
import { Elysia, t } from 'elysia';
import { logController } from '../controllers/logController';

// Using the same DEV_USER_ID you set up before
const DEV_USER_ID = '00000000-0000-0000-0000-000000000001'; 

export const logRoutes = new Elysia({ prefix: '/logs' })
  // .use(authMiddleware) // DISABLED FOR NOW

  .post('/toggle', async ({ body }) => {
    // Hardcode user ID for now
    return await logController.toggleHabitLog(DEV_USER_ID, body);
  }, {
    // isAuthenticated: true, // DISABLED
    body: t.Object({
      habitId: t.String(),
      date: t.String(),
      completed: t.Boolean(),
    }),
  })

  .get('/range', async ({ query }) => {
    return await logController.getLogsForDateRange(
      DEV_USER_ID,
      query.startDate,
      query.endDate
    );
  }, {
    // isAuthenticated: true, // DISABLED
    query: t.Object({
      startDate: t.String(),
      endDate: t.String()
    })
  })

  .get('/monthly', async ({ query }) => {
    const year = parseInt(query.year);
    const month = parseInt(query.month);
    
    if (isNaN(year) || isNaN(month)) {
      throw new Error('Invalid year or month');
    }
    
    return await logController.getMonthlyStats(DEV_USER_ID, year, month);
  }, {
    // isAuthenticated: true, // DISABLED
    query: t.Object({
      year: t.String(),
      month: t.String()
    })
  });
