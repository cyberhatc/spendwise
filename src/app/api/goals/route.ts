import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_GOALS } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/mode";
import { savingsGoalSchema } from "@/lib/validation";
import type { SavingsGoal } from "@/types";

export async function GET(req: Request) {
  if (isDemoMode()) {
    return NextResponse.json({ data: DEMO_GOALS });
  }
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const { data, error } = await client.from("savings_goals").select("*").eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: Request) {
  if (isDemoMode()) {
    const body = await req.json();
    const parsed = savingsGoalSchema.parse(body);
    const data: SavingsGoal = { id: `demo_g_${Date.now()}`, user_id: "demo_user_spendwise", ...parsed, created_at: new Date().toISOString() };
    return NextResponse.json({ data }, { status: 201 });
  }
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const userId = body.userId ?? user.id;
  const parsed = savingsGoalSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid goal" }, { status: 400 });
  const { data, error } = await client.from("savings_goals").insert({ user_id: userId, ...parsed.data }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PUT(req: Request) {
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, userId, ...rest } = body;
  const parsed = savingsGoalSchema.partial().safeParse(rest);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid goal" }, { status: 400 });
  const { data, error } = await client.from("savings_goals").update(parsed.data).eq("id", id).eq("user_id", userId ?? user.id).select().single();
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
  const { error } = await client.from("savings_goals").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
