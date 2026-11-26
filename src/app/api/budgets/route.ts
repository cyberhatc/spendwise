import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return { client, user: null as null };
  return { client, user };
}

export async function GET(req: Request) {
  const { client, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const { data, error } = await client
    .from("budgets")
    .select("*")
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: Request) {
  const { client, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, userId, ...rest } = body;
  const userIdFinal = userId ?? user.id;
  if (!userIdFinal) return NextResponse.json({ error: "userId is required" }, { status: 400 });
  const { category, monthly_limit } = rest;
  if (!category || typeof monthly_limit !== "number") {
    return NextResponse.json({ error: "category and monthly_limit are required" }, { status: 400 });
  }

  if (id) {
    const { data, error } = await client
      .from("budgets")
      .update({ category, monthly_limit, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userIdFinal)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  }

  const { data, error } = await client
    .from("budgets")
    .insert({ user_id: userIdFinal, category, monthly_limit })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { client, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const userId = searchParams.get("userId");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const { error } = await client.from("budgets").delete().eq("id", id).eq("user_id", userId ?? user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
