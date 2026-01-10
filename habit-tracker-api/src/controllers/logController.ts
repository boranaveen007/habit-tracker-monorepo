import { db } from '../config/database';
import { habitLogs, habits } from '../models/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import type { ToggleHabitLogDto } from '../types/index';

export const logController = {
  async toggleHabitLog(userId: string, data: ToggleHabitLogDto) {
    // Verify habit belongs to user
    const habit = await db.query.habits.findFirst({
      where: and(eq(habits.id, data.habitId), eq(habits.userId, userId)),
    });

    if (!habit) {
      throw new Error('Habit not found');
    }

    // Check if log exists
    const existingLog = await db.query.habitLogs.findFirst({
      where: and(
        eq(habitLogs.habitId, data.habitId),
        eq(habitLogs.date, data.date)
      ),
    });

    if (existingLog) {
      // Update existing log
      const [updated] = await db
        .update(habitLogs)
        .set({ completed: data.completed })
        .where(eq(habitLogs.id, existingLog.id))
        .returning();

      return updated;
    } else {
      // Create new log
      const [newLog] = await db
        .insert(habitLogs)
        .values({
          habitId: data.habitId,
          userId,
          date: data.date,
          completed: data.completed,
        })
        .returning();

      return newLog;
    }
  },

  async getLogsForDateRange(userId: string, startDate: string, endDate: string) {
    return await db.query.habitLogs.findMany({
      where: and(
        eq(habitLogs.userId, userId),
        gte(habitLogs.date, startDate),
        lte(habitLogs.date, endDate)
      ),
      with: {
        habit: true,
      },
      orderBy: (habitLogs, { asc }) => [asc(habitLogs.date)],
    });
  },

  async getWeeklyStats(userId: string, startDate: string) {
    const endDate = new Date(startDate);
    if (isNaN(endDate.getTime())) {
      throw new Error('Invalid end date');
    }
    endDate.setDate(endDate.getDate() + 6);
    
    const endDateString = endDate.toISOString().split('T')[0];
    if (!endDateString) {
      throw new Error('End date is invalid');
    }
    
    const logs = await this.getLogsForDateRange(
      userId,
      startDate,
      endDateString
    );

    const userHabits = await db.query.habits.findMany({
      where: and(eq(habits.userId, userId), eq(habits.archived, false)),
    });

    const totalPossible = userHabits.length * 7;
    const totalCompleted = logs.filter(log => log.completed).length;
    const completionRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

    return {
      totalHabits: userHabits.length,
      totalPossible,
      totalCompleted,
      completionRate: Math.round(completionRate * 10) / 10,
      logs,
    };
  },

  async getMonthlyStats(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    if (!startDate || !endDate) {
      throw new Error('Start date and end date must be valid dates');
    }
    
    const logs = await this.getLogsForDateRange(
      userId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const userHabits = await db.query.habits.findMany({
      where: and(eq(habits.userId, userId), eq(habits.archived, false)),
    });

    const daysInMonth = endDate.getDate();
    const totalPossible = userHabits.length * daysInMonth;
    const totalCompleted = logs.filter(log => log.completed).length;
    const completionRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;

    return {
      totalHabits: userHabits.length,
      totalPossible,
      totalCompleted,
      completionRate: Math.round(completionRate * 10) / 10,
      daysInMonth,
      logs,
    };
  },
};
