import { createClient } from "@/lib/supabase/client";

export async function getSessionUser() {
  try {
    const client = createClient();
    const { data } = await client.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

export async function getSession() {
  try {
    const client = createClient();
    const { data } = await client.auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}
