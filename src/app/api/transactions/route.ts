import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/validation";
import type { Transaction } from "@/types";

export async function GET(req: Request) {
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(500, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "10", 10) || 10));
  const search = url.searchParams.get("search") ?? "";
  const category = url.searchParams.get("category") ?? "";
  const type = url.searchParams.get("type") ?? "";
  const month = url.searchParams.get("month") ?? "";

  let query = client
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);
  if (category) query = query.eq("category", category);
  if (month) query = query.gte("date", `${month}-01`).lte("date", `${month}-31`);
  if (search) query = query.or(`description.ilike.%${encodeURIComponent(search)}%,category.ilike.%${encodeURIComponent(search)}%`);

  const { data, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const transactions = (data ?? []) as Transaction[];
  const total = count ?? transactions.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return NextResponse.json({ data: { transactions, total, page, pageSize, totalPages } });
}

export async function POST(req: Request) {
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = transactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid transaction" }, { status: 400 });
  }
  const t = parsed.data;
  const { data, error } = await client.from("transactions").insert({
    user_id: user.id,
    type: t.type,
    amount: t.amount,
    category: t.category,
    description: t.description,
    date: t.date,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: t }, { status: 201 });
}

export async function PUT(req: Request) {
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...rest } = await req.json();
  const parsed = transactionSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid transaction" }, { status: 400 });
  }
  const t = parsed.data;
  const { data, error } = await client
    .from("transactions")
    .update({
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: t.date,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: t });
}

export async function DELETE(req: Request) {
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const userId = searchParams.get("userId");
  if (!id || !userId) return NextResponse.json({ error: "id and userId are required" }, { status: 400 });

  const { error } = await client.from("transactions").delete().eq("id", id).eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
