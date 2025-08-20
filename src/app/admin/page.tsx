"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "로그인 실패");
      } else {
        // 로그인 성공 시 원래 가려던 경로(next) 우선, 없으면 리더보드로 이동
        const params = new URLSearchParams(window.location.search);
        const nextPath = params.get('next');
        const target = nextPath && nextPath !== '/admin' ? nextPath : '/admin/leaderboard';
        window.location.replace(target);
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 16 }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          display: "grid",
          gap: 12,
          border: "1px solid #e5e7eb",
          padding: 24,
          borderRadius: 12,
          background: "white",
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>관리자 로그인</h1>
        <label style={{ display: "grid", gap: 6 }}>
          <span>아이디</span>
          <input
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="아이디"
            required
            style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8 }}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
            style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8 }}
          />
        </label>
        {error && (
          <p style={{ color: "#dc2626", fontSize: 14 }} role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #111827",
            background: "#111827",
            color: "white",
            fontWeight: 600,
          }}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}


