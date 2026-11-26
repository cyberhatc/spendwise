import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_SPLITS } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/mode";
import { splitSchema } from "@/lib/validation";
import type { ExpenseSplit } from "@/types";

export async function GET(req: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ data: DEMO_SPLITS });
  }
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const { data, error } = await client.from("expense_splits").select("*").eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: Request) {
  if (isDemoMode()) {
    const body = await req.json();
    const parsed = splitSchema.parse(body);
    const data: ExpenseSplit = { id: `demo_s_${Date.now()}`, user_id: "demo_user_spendwise", ...parsed, created_at: new Date().toISOString() };
    return NextResponse.json({ data }, { status: 201 });
  }
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const userId = body.userId ?? user.id;
  const parsed = splitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid split" }, { status: 400 });
  const { data, error } = await client.from("expense_splits").insert({ user_id: userId, ...parsed.data }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PUT(req: Request) {
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...rest } = body;
  const parsed = splitSchema.partial().safeParse(rest);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid split" }, { status: 400 });
  const { data, error } = await client.from("expense_splits").update(parsed.data).eq("id", id).eq("user_id", user.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ ok: true });
  }
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const { error } = await client.from("expense_splits").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export interface SplitBody {
  id?: string;
  userId?: string;
  expense_name: string;
  amount: number;
  paid_by: string;
  participants: string[];
  status: "settled" | "pending";
}

export async function PATCH(req: Request) {
  if (isDemoMode()) {
    const body = (await req.json()) as SplitBody;
    const data: ExpenseSplit = { id: body.id ?? `demo_s_${Date.now()}`, user_id: "demo_user_spendwise", ...body, created_at: new Date().toISOString() };
    return NextResponse.json({ data });
  }
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as SplitBody;
  const { id, userId, ...rest } = body;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const { data, error } = await client
    .from("expense_splits")
    .update({ ...rest, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId ?? user.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
