import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseServer";

// 개발 편의를 위한 테스트 계정 시드용 API
// production에서는 보호하거나 제거하세요.
export async function POST(req: NextRequest) {
  const { loginId = "admin", password = "admin1234", role = "admin", name = "테스트관리자" } = await req.json().catch(() => ({}));

  // 동일 login_id 이미 존재 시 덮어쓰기 대신 에러 반환
  const { data: exist } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("login_id", loginId)
    .maybeSingle();

  if (exist) {
    return NextResponse.json({ message: "이미 존재하는 아이디입니다.", loginId }, { status: 409 });
  }

  const hashed = await hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({ login_id: loginId, password: hashed, role, name })
    .select("id, login_id")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ message: "생성 실패", error }, { status: 500 });
  }

  return NextResponse.json({ message: "생성 성공", user: data, plain: { loginId, password } }, { status: 201 });
}


