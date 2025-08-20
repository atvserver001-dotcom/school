'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import TextEditor from './TextEditor';
import ImageUploader from './ImageUploader';

export interface PrincipalInputProps {
  onYearChange?: (year: string) => void;
  onNameChange?: (name: string) => void;
  onImageChange?: (files: File[]) => void;
  onSubmit?: (year: string, name: string, images: File[]) => void;
  onCancel?: () => void;
  initialYear?: string;
  initialName?: string;
  initialImageUrl?: string | null;
  saving?: boolean;
}

export default function PrincipalInput({
  onYearChange,
  onNameChange,
  onImageChange,
  onSubmit,
  onCancel,
  initialYear,
  initialName,
  initialImageUrl,
  saving = false,
}: PrincipalInputProps) {
  const [year, setYear] = useState(initialYear ?? '');
  const [name, setName] = useState(initialName ?? '');
  const [images, setImages] = useState<File[]>([]);

  // 편집 대상 변경 시 폼 값을 동기화
  React.useEffect(() => {
    setYear(initialYear ?? '');
  }, [initialYear]);
  React.useEffect(() => {
    setName(initialName ?? '');
  }, [initialName]);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
        <div style={{ width: '160px' }}>
          <label className="ui-label">년도</label>
          <input
            className="ui-input"
            type="number"
            min={1900}
            max={new Date().getFullYear()}
            step={1}
            placeholder="예: 2024"
            list="years-list"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              onYearChange?.(e.target.value);
            }}
            style={{ minHeight: '38px' }}
          />
          <datalist id="years-list">
            {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y} />
            ))}
          </datalist>
        </div>
        <div style={{ width: '50%' }}>
          <TextEditor
            label="이름"
            placeholder="교장 이름을 입력하세요"
            maxLength={8}
            rows={1}
            value={name}
            onChange={(v) => {
              setName(v);
              onNameChange?.(v);
            }}
            style={{
              resize: 'none',
              overflow: 'hidden',
              height: 'auto',
              minHeight: '38px',
              lineHeight: '20px',
              padding: '8px 12px',
            }}
          />
        </div>
      </div>
      
      <div style={{ width: '100%' }}>
        {initialImageUrl && images.length === 0 ? (
          <div className="ui-thumb" style={{ height: 120, marginBottom: '12px', position: 'relative' }}>
            <Image
              fill
              src={(function toThumb(url: string){
                try {
                  const pub = '/storage/v1/object/public/';
                  const sign = '/storage/v1/object/sign/';
                  if (url.includes(pub)) return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + (url.includes('?') ? '&width=800&quality=80' : '?width=800&quality=80');
                  if (url.includes(sign)) return url.replace('/storage/v1/object/sign/', '/storage/v1/render/image/sign/') + (url.includes('?') ? '&width=800&quality=80' : '?width=800&quality=80');
                  return url;
                } catch { return url; }
              })(initialImageUrl)}
              alt="기존 이미지"
              sizes="(max-width: 640px) 100vw, 800px"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : null}
        <ImageUploader
          label="사진 첨부"
          multiple={false}
          maxFiles={1}
          disableDragAndDrop={true}
          onChange={(f) => {
            setImages(f);
            onImageChange?.(f);
          }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button
          type="button"
          className="ui-button outline"
          onClick={onCancel}
          disabled={saving}
        >
          취소
        </button>
        <button
          type="button"
          className="ui-button primary"
          onClick={() => {
            if (!year.trim()) {
              alert('년도를 입력하거나 선택해주세요.');
              return;
            }
            const yearNumber = parseInt(year, 10);
            const currentYear = new Date().getFullYear();
            if (Number.isNaN(yearNumber) || yearNumber < 1900 || yearNumber > currentYear) {
              alert(`년도는 1900년부터 ${currentYear}년 사이의 숫자로 입력해주세요.`);
              return;
            }
            if (!name.trim()) {
              alert('이름을 입력해주세요.');
              return;
            }
            onSubmit?.(year, name, images);
          }}
          disabled={saving}
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
