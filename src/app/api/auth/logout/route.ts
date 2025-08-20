import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "로그아웃" });
  res.cookies.set("admin_token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return res;
}


