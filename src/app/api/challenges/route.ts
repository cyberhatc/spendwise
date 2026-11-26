import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_CHALLENGES } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/mode";
import { challengeSchema } from "@/lib/validation";
import type { NoSpendChallenge } from "@/types";

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({ data: DEMO_CHALLENGES });
  }
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await client.from("no_spend_challenges").select("*").eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: Request) {
  if (isDemoMode()) {
    const body = await req.json();
    const parsed = challengeSchema.parse(body);
    const data: NoSpendChallenge = { id: `demo_c_${Date.now()}`, user_id: "demo_user_spendwise", ...parsed, spent_amount: 0, is_active: true, created_at: new Date().toISOString() };
    return NextResponse.json({ data }, { status: 201 });
  }
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = challengeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid challenge" }, { status: 400 });
  const { data, error } = await client.from("no_spend_challenges").insert({ user_id: user.id, ...parsed.data }).select().single();
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
  const parsed = challengeSchema.partial().safeParse(rest);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid challenge" }, { status: 400 });
  const { data, error } = await client.from("no_spend_challenges").update(parsed.data).eq("id", id).eq("user_id", user.id).select().single();
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
  const { error } = await client.from("no_spend_challenges").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
