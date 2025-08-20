'use client';

import { useState } from 'react';

export interface LogoutButtonProps {
  redirectTo?: string;
  className?: string;
}

export default function LogoutButton({ redirectTo = '/admin', className }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const onLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore error, proceed redirect
    } finally {
      window.location.replace(redirectTo);
    }
  };

  return (
    <button type="button" className={`ui-button outline ${className ?? ''}`} onClick={onLogout} disabled={loading}>
      {loading ? '로그아웃 중...' : '로그아웃'}
    </button>
  );
}


