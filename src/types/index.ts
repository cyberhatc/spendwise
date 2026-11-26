export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  /** Amount in Indian Rupees (integer rupees). */
  amount: number;
  category: string;
  description: string;
  /** ISO date string, e.g. "2026-11-26" */
  date: string;
  created_at: string;
  updated_at?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  created_at: string;
  updated_at?: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  /** ISO date string yyyy-mm-dd */
  deadline: string;
  created_at: string;
  completed?: boolean;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  next_date: string;
  is_active: boolean;
  created_at: string;
}

export interface ExpenseSplit {
  id: string;
  user_id: string;
  /** Shared group id, e.g. "trip-manali-2026" */
  group_id?: string;
  expense_name: string;
  amount: number;
  /** Who paid */
  paid_by: string;
  participants: string[];
  status: "settled" | "pending";
  created_at: string;
}

export interface NoSpendChallenge {
  id: string;
  user_id: string;
  title: string;
  target_spend: number;
  start_date: string;
  end_date: string;
  /** Spend recorded inside the challenge window. */
  spent_amount: number;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  currency: string;
  theme: "light" | "dark";
  created_at: string;
}

export interface StudentDiscount {
  id: string;
  user_id: string;
  provider: string;
  item: string;
  discount: number;
  code?: string;
  url?: string;
  notes?: string;
  created_at?: string;
}
