import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_DISCOUNTS } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/mode";

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({ data: DEMO_DISCOUNTS });
  }
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await client.from("student_discounts").select("*").eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: Request) {
  if (isDemoMode()) {
    const body = await req.json();
    const discount = { id: `demo_d_${Date.now()}`, user_id: "demo_user_spendwise", ...body };
    return NextResponse.json({ data: [discount] });
  }
  const client = await createClient();
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const userId = body.userId ?? user.id;
  const { error } = await client.from("student_discounts").insert({ user_id: userId, ...body });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data, error: fetchError } = await client.from("student_discounts").select("*").eq("user_id", user.id);
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
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
  const { error } = await client.from("student_discounts").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
