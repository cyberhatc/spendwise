import type { Transaction } from "@/types";

const DEMO_USER_ID = "demo_user_spendwise";

const daysAgo = (n: number, hour = 20) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
};

const isoDayAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

interface DemoSeed {
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  daysAgo: number;
}

const SEED: DemoSeed[] = [
  // Income
  { type: "income", amount: 45000, category: "Income", description: "Monthly stipend — Android Dev Internship", daysAgo: 2 },
  { type: "income", amount: 12000, category: "Income", description: "Freelance UI design gig", daysAgo: 34 },
  { type: "income", amount: 6000, category: "Income", description: "Semester 2 part-time job", daysAgo: 66 },

  // Expenses — Food & Dining
  { type: "expense", amount: 320, category: "Food", description: "Zomato — biryani night with friends", daysAgo: 0 },
  { type: "expense", amount: 180, category: "Food", description: "College canteen lunch (4 days)", daysAgo: 1 },
  { type: "expense", amount: 450, category: "Food", description: "Swiggy — pizza weekend", daysAgo: 2 },
  { type: "expense", amount: 210, category: "Food", description: "Tea break with seniors", daysAgo: 3 },
  { type: "expense", amount: 540, category: "Food", description: "Weekend street food tour", daysAgo: 5 },
  { type: "expense", amount: 165, category: "Food", description: "Office chai & snacks", daysAgo: 8 },
  { type: "expense", amount: 390, category: "Food", description: "Canteen — midterms week", daysAgo: 11 },

  // Transport
  { type: "expense", amount: 120, category: "Transport", description: "Metro card top-up + ride", daysAgo: 0 },
  { type: "expense", amount: 80, category: "Transport", description: "Auto + bus to campus", daysAgo: 2 },
  { type: "expense", amount: 250, category: "Transport", description: "Cab to airport (airport drop)", daysAgo: 6 },
  { type: "expense", amount: 60, category: "Transport", description: "Fuel for scooter", daysAgo: 9 },

  // Education
  { type: "expense", amount: 1500, category: "Education", description: "Printing + project supplies", daysAgo: 1 },
  { type: "expense", amount: 900, category: "Education", description: "Online course subscription", daysAgo: 12 },
  { type: "expense", amount: 320, category: "Education", description: "Lab exam fees", daysAgo: 20 },

  // Shopping
  { type: "expense", amount: 1200, category: "Shopping", description: "New sneakers", daysAgo: 4 },
  { type: "expense", amount: 450, category: "Shopping", description: "Desk lamp & organiser", daysAgo: 7 },
  { type: "expense", amount: 300, category: "Shopping", description: "Winter hoodie", daysAgo: 15 },

  // Entertainment
  { type: "expense", amount: 350, category: "Entertainment", description: "Movie night with college group", daysAgo: 3 },
  { type: "expense", amount: 180, category: "Entertainment", description: "Spotify Premium monthly", daysAgo: 8 },
  { type: "expense", amount: 240, category: "Entertainment", description: "E-sports tournament entry", daysAgo: 14 },

  // Rent
  { type: "expense", amount: 8500, category: "Rent", description: "PG rent — October", daysAgo: 25 },
  { type: "expense", amount: 8500, category: "Rent", description: "PG rent — September", daysAgo: 55 },

  // Bills
  { type: "expense", amount: 650, category: "Bills", description: "Electricity + water bill", daysAgo: 9 },
  { type: "expense", amount: 299, category: "Bills", description: "Mobile recharge", daysAgo: 16 },
  { type: "expense", amount: 1499, category: "Bills", description: "Broadband internet", daysAgo: 23 },

  // Health
  { type: "expense", amount: 420, category: "Health", description: "Pharmacy — fever meds + vitamins", daysAgo: 5 },
  { type: "expense", amount: 800, category: "Health", description: "Dentist visit", daysAgo: 30 },

  // Other
  { type: "expense", amount: 150, category: "Other", description: "Gym membership — October", daysAgo: 10 },
  { type: "expense", amount: 90, category: "Other", description: "Petty cash — chai run", daysAgo: 18 },
];

export function buildDemoTransactions(): Transaction[] {
  return SEED.map((s, i) => ({
    id: `demo_txn_${i + 1}`,
    user_id: DEMO_USER_ID,
    type: s.type,
    amount: s.amount,
    category: s.category,
    description: s.description,
    date: isoDayAgo(s.daysAgo),
    created_at: daysAgo(s.daysAgo),
    is_demo: true,
  }));
}

export const DEMO_USER = {
  id: DEMO_USER_ID,
  email: "demo@spendwise.app",
  full_name: "Aarav Mehta",
};

export interface DemoBudget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  created_at?: string;
  updated_at?: string;
}

export const DEMO_BUDGETS: DemoBudget[] = [
  { id: "demo_b_1", user_id: DEMO_USER_ID, category: "Food", monthly_limit: 6000 },
  { id: "demo_b_2", user_id: DEMO_USER_ID, category: "Transport", monthly_limit: 1500 },
  { id: "demo_b_3", user_id: DEMO_USER_ID, category: "Education", monthly_limit: 5000 },
  { id: "demo_b_4", user_id: DEMO_USER_ID, category: "Shopping", monthly_limit: 3000 },
  { id: "demo_b_5", user_id: DEMO_USER_ID, category: "Entertainment", monthly_limit: 2000 },
  { id: "demo_b_6", user_id: DEMO_USER_ID, category: "Rent", monthly_limit: 8500 },
  { id: "demo_b_7", user_id: DEMO_USER_ID, category: "Bills", monthly_limit: 2500 },
  { id: "demo_b_8", user_id: DEMO_USER_ID, category: "Health", monthly_limit: 1500 },
  { id: "demo_b_9", user_id: DEMO_USER_ID, category: "Other", monthly_limit: 1000 },
];

export interface DemoGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  deadline: string;
  created_at: string;
}

export const DEMO_GOALS: DemoGoal[] = [
  { id: "demo_g_1", user_id: DEMO_USER_ID, name: "Emergency fund", target_amount: 30000, saved_amount: 12000, deadline: isoDayAgo(-150), created_at: daysAgo(80) },
  { id: "demo_g_2", user_id: DEMO_USER_ID, name: "Trip to Goa", target_amount: 15000, saved_amount: 4500, deadline: isoDayAgo(-60), created_at: daysAgo(45) },
  { id: "demo_g_3", user_id: DEMO_USER_ID, name: "New laptop", target_amount: 60000, saved_amount: 0, deadline: isoDayAgo(-300), created_at: daysAgo(120) },
];

export interface DemoSplit {
  id: string;
  user_id: string;
  group_id: string;
  expense_name: string;
  amount: number;
  paid_by: string;
  participants: string[];
  status: "settled" | "pending";
  created_at: string;
}

export const DEMO_SPLITS: DemoSplit[] = [
  { id: "demo_s_1", user_id: DEMO_USER_ID, group_id: "trip-udaipur-2026", expense_name: "Cab + stay — Udaipur trip", amount: 8400, paid_by: "Rahul", participants: ["Rahul", "Priya", "Aarav"], status: "pending", created_at: daysAgo(12) },
  { id: "demo_s_2", user_id: DEMO_USER_ID, group_id: "hostel-mess", expense_name: "Hostel mess bill", amount: 4200, paid_by: "Aarav Mehta", participants: ["Aarav Mehta", "Riya Sharma"], status: "settled", created_at: daysAgo(20) },
];

export interface DemoChallenge {
  id: string;
  user_id: string;
  title: string;
  target_spend: number;
  start_date: string;
  end_date: string;
  spent_amount: number;
  is_active: boolean;
  created_at: string;
}

export const DEMO_CHALLENGES: DemoChallenge[] = [
  { id: "demo_c_1", user_id: DEMO_USER_ID, title: "No junk food October", target_spend: 2000, start_date: isoDayAgo(5).slice(0, 7) + "-01", end_date: isoDayAgo(-25), spent_amount: 450, is_active: true, created_at: daysAgo(10) },
];

export interface DemoRecurring {
  id: string;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  next_date: string;
  is_active: boolean;
  created_at: string;
}

export const DEMO_RECURRING: DemoRecurring[] = [
  { id: "demo_r_1", user_id: DEMO_USER_ID, type: "expense", amount: 199, category: "Entertainment", description: "Netflix subscription", frequency: "monthly", next_date: isoDayAgo(-2).slice(0, 8) + "T00:00:00", is_active: true, created_at: daysAgo(60) },
  { id: "demo_r_2", user_id: DEMO_USER_ID, type: "expense", amount: 150, category: "Other", description: "Gym membership", frequency: "monthly", next_date: isoDayAgo(-3).slice(0, 8) + "T00:00:00", is_active: true, created_at: daysAgo(60) },
  { id: "demo_r_3", user_id: DEMO_USER_ID, type: "expense", amount: 299, category: "Entertainment", description: "Spotify Premium", frequency: "monthly", next_date: isoDayAgo(-1).slice(0, 8) + "T00:00:00", is_active: true, created_at: daysAgo(60) },
  { id: "demo_r_4", user_id: DEMO_USER_ID, type: "income", amount: 8000, category: "Income", description: "Part-time remote stipend", frequency: "monthly", next_date: isoDayAgo(7).slice(0, 8) + "T00:00:00", is_active: true, created_at: daysAgo(90) },
];

export interface DemoDiscount {
  id: string;
  user_id: string;
  provider: string;
  item: string;
  discount: number;
  code?: string;
  url?: string;
  notes?: string;
}

export const DEMO_DISCOUNTS: DemoDiscount[] = [
  { id: "demo_d_1", user_id: DEMO_USER_ID, provider: "Amazon", item: "Dining / Food coupons", discount: 10, code: "AMZSTUDENT10", url: "https://www.amazon.in", notes: "10% off up to ₹100 on dining" },
  { id: "demo_d_2", user_id: DEMO_USER_ID, provider: "Flipkart", item: "Education accessories", discount: 15, code: "FLIPSTUDENT15", url: "https://www.flipkart.com", notes: "15% off on selected edu items" },
  { id: "demo_d_3", user_id: DEMO_USER_ID, provider: "IRCTC", item: "Rail travel", discount: 5, url: "https://www.irctc.com" },
  { id: "demo_d_4", user_id: DEMO_USER_ID, provider: "Steam", item: "Games", discount: 10, url: "https://store.steampowered.com" },
];

