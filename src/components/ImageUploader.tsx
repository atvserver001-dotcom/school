'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface ImageUploaderProps {
  label?: string;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
  disableDragAndDrop?: boolean; // New prop
  onChange?: (files: File[]) => void;
}

interface PreviewItem {
  id: string;
  file: File;
  url: string;
}

export default function ImageUploader({
  label = '사진 업로드',
  multiple = true,
  maxFiles = 10,
  accept = 'image/*',
  disabled = false,
  disableDragAndDrop = false, // Default to false
  onChange,
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [items, setItems] = useState<PreviewItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const itemsRef = useRef<PreviewItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // 언마운트 시에만 남아있는 URL 정리
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => URL.revokeObjectURL(it.url));
    };
  }, []);

  const emitChange = useCallback(
    (next: PreviewItem[]) => {
      onChange?.(next.map((n) => n.file));
    },
    [onChange]
  );

  const pickFiles = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const arr = Array.from(fileList);
      const imageFiles = arr.filter((f) => f.type.startsWith('image/'));
      const current = items;
      const room = Math.max(0, maxFiles - current.length);
      const nextFiles = imageFiles.slice(0, room);
      if (nextFiles.length === 0) return;
      const nextItems: PreviewItem[] = [
        ...current,
        ...nextFiles.map((file, idx) => ({
          id: `${Date.now()}_${idx}_${file.name}`,
          file,
          url: URL.createObjectURL(file),
        })),
      ];
      setItems(nextItems);
      emitChange(nextItems);
    },
    [emitChange, items, maxFiles]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleFiles(e.target.files);
    e.currentTarget.value = '';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const onRemove = (id: string) => {
    const removed = items.find((it) => it.id === id);
    if (removed) URL.revokeObjectURL(removed.url);
    const next = items.filter((it) => it.id !== id);
    setItems(next);
    emitChange(next);
  };

  useEffect(() => {
    if (!previewUrl) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewUrl(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewUrl]);

  return (
    <div>
      {label && <label className="ui-label">{label}</label>}
      <div
        className={`ui-dropzone ${isDragOver && !disableDragAndDrop ? 'dragover' : ''}`}
        onDragOver={disableDragAndDrop ? undefined : (e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={disableDragAndDrop ? undefined : () => setIsDragOver(false)}
        onDrop={disableDragAndDrop ? undefined : onDrop}
        onClick={pickFiles}
        aria-disabled={disabled}
      >
        <p>클릭하여 이미지를 선택하세요{maxFiles ? ` (최대 ${maxFiles}개)` : ''}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />
      </div>

      {items.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div className="ui-preview-grid">
            {items.map((it) => (
              <div key={it.id} className="ui-thumb">
                <img
                  src={it.url}
                  alt={it.file.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewUrl(it.url);
                  }}
                  style={{ cursor: 'zoom-in' }}
                />
                <div className="ui-thumb-actions">
                  <button
                    type="button"
                    aria-label="제거"
                    title="제거"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(it.id);
                    }}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {previewUrl && (
        <div
          onClick={() => setPreviewUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <button
            type="button"
            aria-label="닫기"
            title="닫기"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewUrl(null);
            }}
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(255,255,255,0.9)',
              border: '1px solid #ef4444',
              color: '#ef4444',
              padding: 8,
              borderRadius: 9999,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            src={previewUrl}
            alt="원본 이미지"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              borderRadius: 8,
              backgroundColor: '#fff',
            }}
          />
        </div>
      )}
    </div>
  );
}


