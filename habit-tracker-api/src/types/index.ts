export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    settings?: {
      theme?: string;
      defaultView?: 'weekly' | 'monthly';
    };
  }
  
  export interface Habit {
    id: string;
    userId: string;
    name: string;
    description?: string;
    category?: string;
    startDate: string;
    endDate?: string;
    archived: boolean;
    createdAt: Date;
  }
  
  export interface HabitLog {
    id: string;
    habitId: string;
    userId: string;
    date: string;
    completed: boolean;
    createdAt: Date;
  }
  
  export interface CreateHabitDto {
    name: string;
    description?: string;
    category?: string;
    startDate: string;
    endDate?: string;
  }
  
  export interface UpdateHabitDto {
    name?: string;
    description?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    archived?: boolean;
  }
  
  export interface ToggleHabitLogDto {
    habitId: string;
    date: string;
    completed: boolean;
  }
  
  export interface LoginDto {
    email: string;
    password: string;
  }
  
  export interface RegisterDto {
    email: string;
    name: string;
    password: string;
  }
  