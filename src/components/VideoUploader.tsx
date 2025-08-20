'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface VideoUploaderProps {
  label?: string;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
  onChange?: (files: File[]) => void;
}

interface PreviewItem {
  id: string;
  file: File;
  url: string;
}

export default function VideoUploader({
  label = '영상 업로드',
  multiple = true,
  maxFiles = 4,
  accept = 'video/*',
  disabled = false,
  onChange,
}: VideoUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [items, setItems] = useState<PreviewItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      items.forEach((it) => URL.revokeObjectURL(it.url));
    };
  }, [items]);

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
      const videoFiles = arr.filter((f) => f.type.startsWith('video/'));
      const current = items;
      const room = Math.max(0, maxFiles - current.length);
      const nextFiles = videoFiles.slice(0, room);
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
    const next = items.filter((it) => it.id !== id);
    setItems(next);
    emitChange(next);
  };

  const onClear = () => {
    items.forEach((it) => URL.revokeObjectURL(it.url));
    setItems([]);
    emitChange([]);
  };

  return (
    <div>
      {label && <label className="ui-label">{label}</label>}
      <div
        className={`ui-dropzone ${isDragOver ? 'dragover' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        onClick={pickFiles}
        aria-disabled={disabled}
      >
        <p>
          영상을 드래그 앤 드롭하거나 <b>클릭</b>하여 선택하세요
          {maxFiles ? ` (최대 ${maxFiles}개)` : ''}
        </p>
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
                <video src={it.url} />
                <div className="ui-thumb-actions">
                  <button
                    type="button"
                    className="ui-button outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(it.id);
                    }}
                  >
                    제거
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <span className="ui-badge">{items.length}개 선택됨</span>
            <button type="button" className="ui-button" onClick={pickFiles} disabled={disabled}>
              추가 선택
            </button>
            <button type="button" className="ui-button outline" onClick={onClear} disabled={disabled}>
              모두 지우기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


