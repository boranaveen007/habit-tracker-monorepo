import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';

export const authMiddleware = new Elysia({ name: 'auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET!,
    }),
  )
  // explicit derive with type any to avoid TS issues
  .derive(async (ctx: any) => {
    const auth = ctx.headers.authorization;
    console.log('authMiddleware derive called, auth header:', auth);

    if (!auth || !auth.startsWith('Bearer ')) {
      return { user: null };
    }

    const token = auth.substring(7);
    console.log('Extracted token:', token);

    const payload = await ctx.jwt.verify(token);
    console.log('JWT payload:', payload);

    if (!payload || !payload.userId) {
      return { user: null };
    }

    return {
      user: {
        id: payload.userId as string,
        email: (payload as any).email as string,
      },
    };
  });
