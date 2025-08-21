"use client"
import { useEffect, useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import { ImageCard } from '@/components';
import Image from 'next/image';
// 클라이언트에서 직접 Storage로 올리지 않고, 서버 라우트로 업로드해 인증 사용자를 강제합니다.

export default function SchoolInfoSettingsPage() {
  const [foundingDate, setFoundingDate] = useState<string>('');
  const [principalName, setPrincipalName] = useState<string>('');

  const [greetingImage, setGreetingImage] = useState<File | null>(null);
  const [schoolLogoImage, setSchoolLogoImage] = useState<File | null>(null);
  const [principalImage, setPrincipalImage] = useState<File | null>(null);
  const [mottoImage, setMottoImage] = useState<File | null>(null);
  const [flowerImage, setFlowerImage] = useState<File | null>(null);
  const [anthemSheetImage, setAnthemSheetImage] = useState<File | null>(null);
  const [treeImage, setTreeImage] = useState<File | null>(null);
  const [anthemAudio, setAnthemAudio] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const writerRoles = new Set(['admin', 'editor']);
  const isWriter = userRole ? writerRoles.has(userRole) : false;

  // 읽기 전용 미리보기 URL 상태
  const [principalImageUrl, setPrincipalImageUrl] = useState<string | null>(null);
  const [greetingUrl, setGreetingUrl] = useState<string | null>(null);
  const [schoolLogoUrl, setSchoolLogoUrl] = useState<string | null>(null);
  const [mottoUrl, setMottoUrl] = useState<string | null>(null);
  const [flowerUrl, setFlowerUrl] = useState<string | null>(null);
  const [treeUrl, setTreeUrl] = useState<string | null>(null);
  const [anthemSheetUrl, setAnthemSheetUrl] = useState<string | null>(null);
  const [anthemAudioUrl, setAnthemAudioUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const json = await res.json();
        setUserRole(json?.user?.role ?? null);
      } catch {
        setUserRole(null);
      }
    })();
  }, []);

  // 초기 데이터 로딩 + 재사용 함수
  const loadDetails = async () => {
    try {
      const res = await fetch('/api/school-details/get', { cache: 'no-store' });
      if (!res.ok) return;
      const { row, signed } = await res.json();
      if (!row) return;
      setFoundingDate(row.founding_date ?? '');
      setPrincipalName(row.principal_name ?? '');
      // 서명 URL이 있으면 우선 사용, 없으면 원본 URL 사용
      setPrincipalImageUrl(signed?.principal_image_url ?? row.principal_image_url ?? null);
      setGreetingUrl(signed?.greeting_url ?? row.greeting_url ?? null);
      setSchoolLogoUrl(signed?.school_logo_url ?? row.school_logo_url ?? null);
      setMottoUrl(signed?.motto_url ?? row.motto_url ?? null);
      setFlowerUrl(signed?.school_flower_url ?? row.school_flower_url ?? null);
      setTreeUrl(signed?.school_tree_url ?? row.school_tree_url ?? null);
      setAnthemSheetUrl(signed?.anthem_sheet_url ?? row.anthem_sheet_url ?? null);
      setAnthemAudioUrl(signed?.anthem_audio_url ?? row.anthem_audio_url ?? null);
    } catch {
      // noop
    }
  };

  useEffect(() => {
    loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toThumbnailUrl(originalUrl: string | null | undefined, width: number = 960, quality: number = 78): string | null {
    if (!originalUrl) return null;
    try {
      const publicToken = '/storage/v1/object/public/';
      const signToken = '/storage/v1/object/sign/';
      if (originalUrl.includes(publicToken)) {
        return originalUrl
          .replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
          .concat(originalUrl.includes('?') ? `&width=${width}&quality=${quality}` : `?width=${width}&quality=${quality}`);
      }
      if (originalUrl.includes(signToken)) {
        return originalUrl
          .replace('/storage/v1/object/sign/', '/storage/v1/render/image/sign/')
          .concat(originalUrl.includes('?') ? `&width=${width}&quality=${quality}` : `?width=${width}&quality=${quality}`);
      }
      return originalUrl;
    } catch {
      return originalUrl;
    }
  }
  const isBlobOrDataUrl = (url: string) => url.startsWith('blob:') || url.startsWith('data:');

  const onSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const form = new FormData();
      form.set('foundingDate', foundingDate);
      form.set('principalName', principalName);
      if (greetingImage) form.set('greetingImage', greetingImage);
      if (schoolLogoImage) form.set('schoolLogoImage', schoolLogoImage);
      if (principalImage) form.set('principalImage', principalImage);
      if (mottoImage) form.set('mottoImage', mottoImage);
      if (flowerImage) form.set('flowerImage', flowerImage);
      if (treeImage) form.set('treeImage', treeImage);
      if (anthemSheetImage) form.set('anthemSheetImage', anthemSheetImage);
      if (anthemAudio) form.set('anthemAudio', anthemAudio);

      const res = await fetch('/api/school-details/save', {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({} as any));
        throw new Error(msg?.message ?? '저장 실패');
      }
      const result = await res.json();
      // eslint-disable-next-line no-console
      console.log('save result:', result);
      if (principalImage && !result?.urls?.principalImageUrl) {
        alert('교장선생님 사진 업로드 URL이 반환되지 않았습니다. 버킷 설정을 확인하세요.');
        return;
      }
      // 저장 성공 시, 로컬 상태 즉시 갱신
      if (result?.urls) {
        if (result.urls.principalImageUrl) setPrincipalImageUrl(result.urls.principalImageUrl);
        if (result.urls.greetingUrl) setGreetingUrl(result.urls.greetingUrl);
        if (result.urls.schoolLogoUrl) setSchoolLogoUrl(result.urls.schoolLogoUrl);
        if (result.urls.mottoUrl) setMottoUrl(result.urls.mottoUrl);
        if (result.urls.flowerUrl) setFlowerUrl(result.urls.flowerUrl);
        if (result.urls.treeUrl) setTreeUrl(result.urls.treeUrl);
        if (result.urls.anthemSheetUrl) setAnthemSheetUrl(result.urls.anthemSheetUrl);
        if (result.urls.anthemAudioUrl) setAnthemAudioUrl(result.urls.anthemAudioUrl);
      }
      // 서버 최신값으로 동기화
      await loadDetails();
      alert('저장되었습니다.');
    } catch (err: any) {
      alert(`저장 중 오류가 발생했습니다.\n${err?.message ?? err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ui-container">
      <div className="ui-section-title">
        <h2>학교정보 설정</h2>
      </div>

      <div className="ui-card">
        {/* 기존 저장된 URL 미리보기(읽기 전용) */}
        <div className="ui-grid" style={{ marginBottom: 16 }}>
        
          <div className="ui-col-6">
            <label className="ui-label" >설립일</label>
            <input
              type="date"
              className="ui-input"
              value={foundingDate}
              onChange={(e) => setFoundingDate(e.target.value)}
              disabled={isSaving || !isWriter}
            />
          </div>

          <div className="ui-col-6">
            <label className="ui-label">교장선생님 성함</label>
            <input
              type="text"
              className="ui-input"
              placeholder="교장 성함을 입력하세요"
              value={principalName}
              onChange={(e) => setPrincipalName(e.target.value)}
              disabled={isSaving || !isWriter}
            />
          </div>

          <div className="ui-col-6">
            <ImageCard title="교장선생님 사진" imageUrl={principalImageUrl ?? undefined} disabled={!isWriter || isSaving} onSelect={(file) => setPrincipalImage(file)} onPreview={(url) => setPreviewUrl(url)} priority />
          </div>
          <div className="ui-col-6">
            <ImageCard title="학교 인사말 이미지" imageUrl={greetingUrl ?? undefined} disabled={!isWriter || isSaving} onSelect={(file) => setGreetingImage(file)} onPreview={(url) => setPreviewUrl(url)} />
          </div>
          <div className="ui-col-6">
            <ImageCard title="학교 로고 이미지" imageUrl={schoolLogoUrl ?? undefined} disabled={!isWriter || isSaving} onSelect={(file) => setSchoolLogoImage(file)} onPreview={(url) => setPreviewUrl(url)} />
          </div>
          <div className="ui-col-6">
            <ImageCard title="교훈 이미지" imageUrl={mottoUrl ?? undefined} disabled={!isWriter || isSaving} onSelect={(file) => setMottoImage(file)} onPreview={(url) => setPreviewUrl(url)} />
          </div>
          <div className="ui-col-6">
            <ImageCard title="교화 이미지" imageUrl={flowerUrl ?? undefined} disabled={!isWriter || isSaving} onSelect={(file) => setFlowerImage(file)} onPreview={(url) => setPreviewUrl(url)} />
          </div>
          <div className="ui-col-6">
            <ImageCard title="교목 이미지" imageUrl={treeUrl ?? undefined} disabled={!isWriter || isSaving} onSelect={(file) => setTreeImage(file)} onPreview={(url) => setPreviewUrl(url)} />
          </div>
          <div className="ui-col-6">
            <ImageCard title="교가 악보 이미지" imageUrl={anthemSheetUrl ?? undefined} disabled={!isWriter || isSaving} onSelect={(file) => setAnthemSheetImage(file)} onPreview={(url) => setPreviewUrl(url)} />
          </div>
          {/* <div className="ui-col-6">
            <div className="ui-card" style={{ padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>교가 오디오</div>
                <button type="button" className="ui-button outline" onClick={() => document.getElementById('anthem-audio-input')?.click()} disabled={!isWriter || isSaving}>변경</button>
              </div>
              {anthemAudioUrl ? (
                <audio controls src={anthemAudioUrl} style={{ width: '100%' }} />
              ) : (
                <div style={{ color: 'var(--color-muted)' }}>오디오가 없습니다. 아래 버튼으로 추가하세요.</div>
              )}
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" className="ui-button outline" onClick={() => document.getElementById('anthem-audio-input')?.click()} disabled={!isWriter || isSaving}>추가</button>
              </div>
              <input id="anthem-audio-input" type="file" accept="audio/*" style={{ display: 'none' }} onChange={(e) => setAnthemAudio(e.target.files?.[0] ?? null)} />
            </div>
          </div> */}
        </div>
        
        

        <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
          <button type="button" className="ui-button primary" onClick={onSave} disabled={isSaving || !isWriter}>
            저장
          </button>
         
        </div>
      </div>
      {previewUrl && (
        <div
          onClick={() => setPreviewUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '92vw', height: '82vh', position: 'relative', borderRadius: 8, overflow: 'hidden' }}
          >
            {(() => {
              const baseUrl = previewUrl as string;
              const unopt = isBlobOrDataUrl(baseUrl);
              const src = unopt ? baseUrl : (toThumbnailUrl(baseUrl, 1280, 80) as string);
              return (
                <Image
                  fill
                  src={src}
                  alt="원본 미리보기"
                  unoptimized={true}
                  sizes="92vw"
                  style={{ objectFit: 'contain' }}
                  priority
                />
              );
            })()}
            <div style={{ position: 'absolute', left: 0, bottom: 12, width: '100%', display: 'flex', justifyContent: 'center', gap: 8 }}>
              <button type="button" className="ui-button primary" onClick={() => setPreviewUrl(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


