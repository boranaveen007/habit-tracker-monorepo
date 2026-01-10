import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { authRoutes } from './routes/auth';
import { habitRoutes } from './routes/habits';
import { logRoutes } from './routes/logs';

const app = new Elysia()
  .use(cors())
  .get('/', () => ({ message: 'Habit Tracker API' }))
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .use(authRoutes)
  .use(habitRoutes)
  .use(logRoutes)
  .onError(({ code, error, set }) => {
    console.error('Error:', error);
    
    if (code === 'VALIDATION') {
      set.status = 400;
      return { error: 'Validation error', message: error.message };
    }
    
    set.status = code === 'NOT_FOUND' ? 404 : 500;
    return { error: (error instanceof Error ? error.message : 'Internal server error') };
  })
  .listen(process.env.PORT || 3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
