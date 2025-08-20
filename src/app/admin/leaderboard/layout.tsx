import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJwt } from "@/lib/jwt";
import { LogoutButton } from "@/components";
import Link from "next/link";

type MenuItem = {
  title: string;
  description: string;
  href: string;
};

const MENUS: MenuItem[] = [
  { title: "사용자 설정", description: "관리자/사용자 권한 및 계정 관리", href: "/admin/leaderboard/users" },
  { title: "학교정보 설정", description: "학교장 및 학교 정보 설정 ", href: "/admin/leaderboard/school-info" },
  { title: "학교연혁 설정", description: "연혁 항목 추가/수정", href: "/admin/leaderboard/histories" },
  { title: "역대학교장 설정", description: "역대 교장 이력 관리", href: "/admin/leaderboard/principals" },
  { title: "교직원정보 설정", description: "교직원 프로필 및 부서 관리", href: "/admin/leaderboard/staff" },
  { title: "행사앨범 설정", description: "행사별 사진/영상 앨범 관리", href: "/admin/leaderboard/event-albums" },
  { title: "졸업앨범 설정", description: "졸업반/졸업생 앨범 관리", href: "/admin/leaderboard/graduation-albums" },
];

export default async function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const session = token ? verifyJwt(token) : null;
  if (!session) {
    redirect("/admin");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>관리 콘솔</h2>
          <LogoutButton />
        </div>
        <nav className="admin-sidebar-nav">
          <ul>
            {MENUS.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="admin-sidebar-link">
                  <strong>{m.title}</strong>
                  <span>{m.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}


