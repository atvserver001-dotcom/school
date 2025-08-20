'use client';

import { useEffect, useRef, useState } from 'react';

export interface ImageCardProps {
  title: string;
  imageUrl?: string | null;
  disabled?: boolean;
  accept?: string; // default: image/*
  onSelect: (file: File) => void;
  onPreview?: (url: string) => void;
}

export default function ImageCard({ title, imageUrl, disabled, accept = 'image/*', onSelect, onPreview }: ImageCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewOnSelectRef = useRef<boolean>(true);
  const suppressNextPreviewRef = useRef<boolean>(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const pick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);
  const hasAnyImage = Boolean(localPreviewUrl || imageUrl);

  return (
    <div className="ui-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ position: 'relative', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', textAlign: 'center', minHeight: 48 }}>
        <span style={{ fontWeight: 700 }}>{title}</span>
        {hasAnyImage && (
          <button
            type="button"
            className="ui-button outline"
            onClick={(e) => {
              e.stopPropagation();
              // 타이틀 우측 변경 버튼: 선택만 수행하고 미리보기는 열지 않음
              previewOnSelectRef.current = false;
              suppressNextPreviewRef.current = true;
              pick();
            }}
            disabled={disabled}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}
          >
            변경
          </button>
        )}
      </div>
      <div
        onClick={(e) => {
          // 메인 영역 클릭 시, 파일선택만 혹은 프리뷰만 수행
          // 하단 버튼에서 발생한 클릭 이벤트와 구분하기 위해 버블링 제어
          e.stopPropagation();
          if (disabled) return;
          // 하단 버튼에서 직전에 선택을 시작했다면 이번 클릭에 대한 미리보기는 억제
          if (suppressNextPreviewRef.current) {
            suppressNextPreviewRef.current = false;
            return;
          }
          const effectiveUrl = localPreviewUrl ?? imageUrl;
          if (effectiveUrl) {
            if (onPreview) onPreview(effectiveUrl);
          } else {
            // 메인 영역(＋)로 선택 시작 → 선택 후 즉시 미리보기 표시
            previewOnSelectRef.current = true;
            pick();
          }
        }}
        style={{
          position: 'relative',
          width: '100%',
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        {localPreviewUrl || imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={localPreviewUrl ?? (imageUrl as string)} alt={title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              border: '2px dashed var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-muted)'
            }}
          >
            <span style={{ fontSize: 36, lineHeight: 1 }}>+</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={(e) => {
            // 어떤 경우든 다음 프리뷰 억제 플래그는 해제
            suppressNextPreviewRef.current = false;
            const f = e.target.files?.[0];
            if (f) {
              if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
              const url = URL.createObjectURL(f);
              // 썸네일은 항상 최신 선택으로 갱신 (오버레이는 메인 영역 클릭으로만 열림)
              setLocalPreviewUrl(url);
              onSelect(f);
            }
            e.currentTarget.value = '';
          }}
          disabled={disabled}
        />
      </div>
      {false}
    </div>
  );
}


