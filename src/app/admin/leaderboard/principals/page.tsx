'use client';

import { useState, useEffect } from 'react';
import { PrincipalInput, PersonCard } from '@/components';

interface Principal {
  id: string;
  year: number;
  name: string;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function PrincipalsSettingsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Principal | null>(null);

  // 교장 목록 불러오기
  const fetchPrincipals = async () => {
    try {
      const response = await fetch('/api/principals');
      if (response.ok) {
        const result = await response.json();
        const items = (result.data || []) as Principal[];
        // 년도 내림차순으로 정렬 보장
        items.sort((a, b) => Number(b.year) - Number(a.year));
        setPrincipals(items);
      } else {
        console.error('Failed to fetch principals');
      }
    } catch (error) {
      console.error('Error fetching principals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrincipals();
  }, []);

  const handleAddPrincipal = async (year: string, name: string, images: File[]) => {
    setSaving(true);
    try {
      const form = new FormData();
      form.append('year', year);
      form.append('name', name.trim());
      if (images.length > 0) form.append('image', images[0]);

      const response = await fetch('/api/principals', {
        method: 'POST',
        body: form,
      });

      if (response.ok) {
        const result = await response.json();
        const newItem = result.data as Principal;
        setPrincipals(prev => {
          const next = [...prev, newItem];
          next.sort((a, b) => Number(b.year) - Number(a.year));
          return next;
        });
        setShowAddModal(false);
        alert('역대 학교장이 추가되었습니다.');
      } else {
        const error = await response.json();
        alert(error.error || '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error saving principal:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (item: Principal) => {
    setEditing(item);
  };

  const handleUpdatePrincipal = async (year: string, name: string, images: File[]) => {
    if (!editing) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.append('id', editing.id);
      form.append('year', year);
      form.append('name', name.trim());
      if (editing.image_url) form.append('old_image_url', editing.image_url);
      if (images.length > 0) form.append('image', images[0]);

      const response = await fetch('/api/principals', {
        method: 'PUT',
        body: form,
      });

      if (response.ok) {
        const result = await response.json();
        const updated = result.data as Principal;
        setPrincipals((prev) => {
          const next = prev.map((p) => (p.id === updated.id ? updated : p));
          next.sort((a, b) => Number(b.year) - Number(a.year));
          return next;
        });
        setEditing(null);
        alert('정보가 수정되었습니다.');
      } else {
        const error = await response.json();
        alert(error.error || '수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error updating principal:', error);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrincipal = async (item: Principal) => {
    if (!confirm(`${item.year}년 ${item.name} 교장 기록을 삭제할까요?`)) return;
    try {
      const response = await fetch(`/api/principals?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      if (response.ok) {
        setPrincipals((prev) => prev.filter((p) => p.id !== item.id));
      } else {
        const error = await response.json();
        alert(error.error || '삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error deleting principal:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="ui-container">
      <div className="ui-section-title">
        <h2>역대학교장 설정</h2>
        <p>역대 교장 이력을 관리합니다.</p>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className="ui-button primary"
          onClick={() => setShowAddModal(true)}
          disabled={loading}
        >
          추가하기
        </button>
      </div>

      {/* 기존 교장 목록 */}
      <div className="ui-card">
        <div className="ui-section-title" style={{ marginTop: 0 }}>
          <h3>역대 교장 목록</h3>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>목록을 불러오는 중...</p>
          </div>
        ) : principals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>등록된 교장이 없습니다.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: '16px',
            marginTop: '16px' 
          }}>
            {principals.map((principal) => (
              <div key={principal.id}>
                <PersonCard
                  year={principal.year.toString()}
                  name={principal.name}
                  imageUrl={principal.image_url}
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                  <button
                    type="button"
                    className="ui-button outline"
                    onClick={() => handleStartEdit(principal)}
                  >
                    편집
                  </button>
                  <button
                    type="button"
                    className="ui-button outline"
                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                    onClick={() => handleDeletePrincipal(principal)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 추가 팝업 */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="ui-card"
            style={{
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
              margin: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ui-section-title" style={{ marginTop: 0 }}>
              <h3>역대 교장 추가</h3>
              <p>새로운 교장 정보를 입력하세요.</p>
            </div>
            <PrincipalInput
              onSubmit={handleAddPrincipal}
              onCancel={() => setShowAddModal(false)}
              saving={saving}
            />
          </div>
        </div>
      )}

      {/* 편집 팝업 */}
      {editing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setEditing(null)}
        >
          <div
            className="ui-card"
            style={{
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
              margin: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ui-section-title" style={{ marginTop: 0 }}>
              <h3>역대 교장 편집</h3>
              <p>교장 정보를 수정하세요.</p>
            </div>
            <PrincipalInput
              initialYear={editing.year?.toString?.() ?? String(editing.year)}
              initialName={editing.name}
              initialImageUrl={editing.image_url ?? null}
              onSubmit={handleUpdatePrincipal}
              onCancel={() => setEditing(null)}
              saving={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
}


