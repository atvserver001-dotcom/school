'use client';

import { useEffect, useState } from 'react';
import { HistoryInput, HistoryTimeline } from '@/components';
import type { HistoryTimelineItem } from '@/components';

export default function HistoriesSettingsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [items, setItems] = useState<Array<{ id?: string | number; date: string; title: string; content: string; imageUrl?: string | null }>>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<null | { id: string | number; date: string; title: string; content: string; imageUrl?: string | null }>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/histories/list', { cache: 'no-store' });
      if (!res.ok) throw new Error('목록 조회 실패');
      const data = await res.json();
      const mapped = Array.isArray(data)
        ? data.map((it: any) => ({
            id: it.id,
            date: it.date,
            title: it.title,
            content: it.content,
            imageUrl: it.imageUrl ?? it.image_url ?? null,
          }))
        : [];
      setItems(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async (date: string, title: string, content: string, images: File[]) => {
    try {
      const form = new FormData();
      form.append('date', date);
      form.append('title', title);
      form.append('content', content);
      if (images && images[0]) {
        form.append('image', images[0]);
      }

      const isEditing = Boolean(editing?.id);
      const endpoint = isEditing ? `/api/histories/${editing?.id}` : '/api/histories/save';
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetch(endpoint, { method, body: form });

      if (!response.ok) {
        throw new Error('저장에 실패했습니다.');
      }

      setIsAddModalOpen(false);
      setEditing(null);
      await fetchItems();
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDelete = async (itemId: string | number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/histories/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');
      await fetchItems();
    } catch (e) {
      console.error(e);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="ui-container">
      <div className="ui-section-title">
        <h2>학교연혁 설정</h2>
        <p>연혁 항목을 추가/수정/정렬합니다.</p>
      </div>
      <div className="ui-card">
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="ui-button primary"
            onClick={() => { setEditing(null); setIsAddModalOpen(true); }}
          >
            연혁 추가하기
          </button>
          {loading ? <span className="ui-badge">불러오는 중...</span> : <span className="ui-badge">총 {items.length}건</span>}
        </div>
        {items.length > 0 ? (
          <HistoryTimeline
            items={items}
            onEdit={(it: HistoryTimelineItem) => {
              setEditing({ id: (it.id as any) ?? '', date: it.date, title: it.title, content: it.content ?? '', imageUrl: (it as any).imageUrl ?? (it as any).image_url ?? null });
              setIsAddModalOpen(true);
            }}
            onDelete={(it: HistoryTimelineItem) => handleDelete(it.id as any)}
          />
        ) : (
          !loading && <div style={{ textAlign: 'center', color: 'var(--color-muted)', padding: 24 }}>저장된 연혁이 없습니다. 좌측 상단의 버튼으로 추가하세요.</div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="ui-modal-overlay" >
          <div className="ui-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="ui-modal-header">
              <h3>{editing ? '연혁 편집' : '연혁 추가'}</h3>
              
            </div>
            <div className="ui-modal-content">
              <HistoryInput
                initialDate={editing?.date}
                initialTitle={editing?.title}
                initialContent={editing?.content}
                initialImageUrl={editing?.imageUrl ?? null}
                onSubmit={handleSave}
                onCancel={() => { setIsAddModalOpen(false); setEditing(null); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


