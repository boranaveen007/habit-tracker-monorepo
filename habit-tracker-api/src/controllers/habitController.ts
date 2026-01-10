import { db } from '../config/database';
import { habits, habitLogs } from '../models/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import type { CreateHabitDto, UpdateHabitDto } from '../types/index';

export const habitController = {
  async createHabit(userId: string, data: CreateHabitDto) {
    const [habit] = await db
      .insert(habits)
      .values({
        userId,
        name: data.name,
        description: data.description,
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate,
      })
      .returning();

    return habit;
  },

  async getUserHabits(userId: string, includeArchived: boolean = false) {
    const whereConditions = includeArchived
      ? eq(habits.userId, userId)
      : and(eq(habits.userId, userId), eq(habits.archived, false));

    return await db.query.habits.findMany({
      where: whereConditions,
      orderBy: (habits, { asc }) => [asc(habits.createdAt)],
    });
  },

  async getHabitById(habitId: string, userId: string) {
    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, habitId), eq(habits.userId, userId)),
    });

    if (!habit) {
      throw new Error('Habit not found');
    }

    return habit;
  },

  async updateHabit(habitId: string, userId: string, data: UpdateHabitDto) {
    const [updated] = await db
      .update(habits)
      .set(data)
      .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
      .returning();

    if (!updated) {
      throw new Error('Habit not found');
    }

    return updated;
  },

  async deleteHabit(habitId: string, userId: string) {
    const deleted = await db
      .delete(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      throw new Error('Habit not found');
    }

    return { message: 'Habit deleted successfully' };
  },

  async getHabitWithStreak(habitId: string, userId: string) {
    const habit = await this.getHabitById(habitId, userId);
    
    // Get all completed logs for streak calculation
    const logs = await db.query.habitLogs.findMany({
      where: and(
        eq(habitLogs.habitId, habitId),
        eq(habitLogs.completed, true)
      ),
      orderBy: (habitLogs, { desc }) => [desc(habitLogs.date)],
    });

    // Calculate current streak
    let streak = 0;
    const today = new Date().toISOString().split('T')[0] || new Date().toString();
    let currentDate = new Date(today);

    for (const log of logs) {
      const logDate = new Date(log.date);
      const diffDays = Math.floor((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
        currentDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
      } else if (diffDays > streak) {
        break;
      }
    }

    return {
      ...habit,
      currentStreak: streak,
      totalCompletions: logs.length,
    };
  },
};
