import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const client = await createClient();
  let error: string | null = null;

  if (code) {
    const { error: err } = await client.auth.exchangeCodeForSession(code);
    error = err?.message ?? null;
  } else if (token_hash && type) {
    const { error: err } = await client.auth.verifyOtp({
      type: type as "signup" | "login" | "recovery" | "email" | "magiclink",
      token_hash,
    });
    error = err?.message ?? null;
  }

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
  }
  return NextResponse.redirect(`${origin}/dashboard`);
}
