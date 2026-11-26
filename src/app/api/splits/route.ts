import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { splitSchema } from "@/lib/validation";

export async function GET(req: Request) {
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
