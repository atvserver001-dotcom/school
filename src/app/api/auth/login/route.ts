import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { compare } from "bcryptjs";
import { signJwt } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { loginId, password } = await req.json();
    if (!loginId || !password) {
      return NextResponse.json({ message: "아이디와 비밀번호를 입력하세요." }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, login_id, password, role, name, email")
      .eq("login_id", loginId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: "서버 오류" }, { status: 500 });
    }
    if (!user) {
      return NextResponse.json({ message: "존재하지 않는 계정입니다." }, { status: 401 });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const token = signJwt({
      userId: user.id,
      loginId: user.login_id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    const res = NextResponse.json({
      message: "로그인 성공",
      user: {
        id: user.id,
        loginId: user.login_id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    });
    // httpOnly 쿠키에 저장
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 1, // 1d
    });

    // 마지막 로그인 시각 업데이트(실패하더라도 로그인은 성공)
    await supabaseAdmin
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", user.id);

    return res;
  } catch (e) {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
}


