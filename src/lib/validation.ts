import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .number()
    .positive({ message: "Amount must be greater than 0" })
    .max(100000000, { message: "Amount is unrealistically large" }),
  category: z.string().min(1, { message: "Please choose a category" }),
  description: z.string().max(120, { message: "Description must be under 120 characters" }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date" }),
});

export const budgetSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  monthly_limit: z.number().positive({ message: "Limit must be positive" }),
});

export const savingsGoalSchema = z.object({
  name: z.string().min(2, { message: "Goal name must be at least 2 characters" }),
  target_amount: z.number().positive({ message: "Target must be positive" }),
  saved_amount: z.number().nonnegative({ message: "Saved amount cannot be negative" }),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid deadline" }),
});

export const recurringSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive({ message: "Amount must be positive" }),
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().min(2, { message: "Description must be at least 2 characters" }),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  next_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date" }),
});

export const splitSchema = z.object({
  expense_name: z.string().min(2, { message: "Expense name is required" }),
  amount: z.number().positive({ message: "Amount must be positive" }),
  paid_by: z.string().min(1, { message: "Payer is required" }),
  participants: z.array(z.string()).min(1, { message: "Add at least one participant" }),
  status: z.enum(["settled", "pending"]),
});

export const challengeSchema = z.object({
  title: z.string().min(2, { message: "Challenge title is required" }),
  target_spend: z.number().positive({ message: "Target spend must be positive" }),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid start date" }),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid end date" }),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>;
export type RecurringInput = z.infer<typeof recurringSchema>;
export type SplitInput = z.infer<typeof splitSchema>;
export type ChallengeInput = z.infer<typeof challengeSchema>;
