// src/controllers/authController.ts
import { db } from '../config/database';
import { users } from '../models/schema';
import { eq } from 'drizzle-orm';
import type { LoginDto, RegisterDto } from '../types/index';

const bcrypt = require('bcrypt');

export const authController = {
  async register(data: RegisterDto) {
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        name: data.name,
        passwordHash,
        settings: JSON.stringify({ theme: 'light', defaultView: 'today' }), // Default settings
      })
      .returning();

    if (!newUser) {
      throw new Error('User creation failed');
    }

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
      settings: newUser.settings ? JSON.parse(newUser.settings as string) : {},
    };
  },

  async login(data: LoginDto) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);

    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    // Parse settings safely
    const settings = user.settings && typeof user.settings === 'string'
      ? JSON.parse(user.settings)
      : (user.settings || {});

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      settings,
    };
  },

  async getProfile(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    const settings = user.settings && typeof user.settings === 'string'
      ? JSON.parse(user.settings)
      : (user.settings || {});

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      settings,
    };
  },

  // NEW METHOD: Update Profile Settings
  async updateProfile(userId: string, data: { settings?: any }) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Merge existing settings with new ones
    const currentSettings = user.settings && typeof user.settings === 'string'
      ? JSON.parse(user.settings)
      : (user.settings || {});

    const newSettings = {
      ...currentSettings,
      ...data.settings,
    };

    const [updatedUser] = await db
      .update(users)
      .set({
        settings: JSON.stringify(newSettings),
      })
      .where(eq(users.id, userId))
      .returning();

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      settings: newSettings,
    };
  },
};
