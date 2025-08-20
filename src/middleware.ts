import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 로그인 페이지 경로
const LOGIN_PATH = '/admin';
const LEADERBOARD_PATH = '/admin/leaderboard';

function isPublicPath(pathname: string): boolean {
  // 로그인 페이지 및 인증 관련 API는 예외 처리
  if (pathname === LOGIN_PATH) return true;
  if (pathname.startsWith('/api/auth/')) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적/이미지/아이콘 등은 제외 (matcher에서도 제외되지만 대비)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token')?.value;

  // 이미 로그인한 사용자가 로그인 페이지 접근 시 리더보드로 보내기
  if (pathname === LOGIN_PATH && token) {
    const url = request.nextUrl.clone();
    url.pathname = LEADERBOARD_PATH;
    return NextResponse.redirect(url);
  }

  // 공개 경로를 제외한 모든 경로는 토큰 필요
  if (!isPublicPath(pathname)) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// 모든 페이지를 보호하되, 정적/이미지/아이콘/Next 내부 경로는 제외
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};


