// src/components/HabitCard.tsx
type Habit = {
    id: string;
    name: string;
    category?: string;
  };
  
  type Props = {
    habit: Habit;
    date: string;
    completed: boolean;
    onToggle: (next: boolean) => void;
  };
  
  export default function HabitCard({ habit, completed, onToggle }: Props) {
    return (
      <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-col">
          <span className="font-medium">{habit.name}</span>
          {habit.category && (
            <span className="mt-1 text-xs text-gray-500">{habit.category}</span>
          )}
        </div>
        <button
          onClick={() => onToggle(!completed)}
          className={`h-6 w-6 rounded-full border ${
            completed ? 'bg-green-500 border-green-500' : 'bg-white'
          }`}
          aria-label="Toggle completion"
        />
      </div>
    );
  }
  