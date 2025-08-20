import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const loginId = searchParams.get("loginId");
  if (!loginId) return NextResponse.json({ message: "loginId 필요" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, login_id, password, role, name, email, last_login_at, created_at")
    .eq("login_id", loginId)
    .maybeSingle();

  if (error) return NextResponse.json({ error }, { status: 500 });
  if (!data) return NextResponse.json({ message: "not found" }, { status: 404 });

  return NextResponse.json({ user: data }, { status: 200 });
}


