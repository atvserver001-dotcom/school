'use client';

import React, { useState } from 'react';
import TextEditor from './TextEditor'; // TextEditor 컴포넌트 import
import ImageUploader from './ImageUploader'; // ImageUploader 컴포넌트 import

export interface HistoryInputProps {
  onDateChange?: (date: string) => void;
  onTitleChange?: (title: string) => void;
  onContentChange?: (content: string) => void;
  onImageChange?: (files: File[]) => void;
  onSubmit?: (date: string, title: string, content: string, images: File[]) => void;
  onCancel?: () => void;
  initialDate?: string;
  initialTitle?: string;
  initialContent?: string;
  initialImageUrl?: string | null;
}

export default function HistoryInput({
  onDateChange,
  onTitleChange,
  onContentChange,
  onImageChange,
  onSubmit,
  onCancel,
  initialDate,
  initialTitle,
  initialContent,
  initialImageUrl,
}: HistoryInputProps) {
  const [date, setDate] = useState(initialDate ?? '');
  const [title, setTitle] = useState(initialTitle ?? '');
  const [content, setContent] = useState(initialContent ?? '');
  const [images, setImages] = useState<File[]>([]);

  // 편집 대상 변경 시 폼 값을 동기화
  // (모달이 열린 상태에서 다른 항목 편집을 눌렀을 때 반영되도록)
  React.useEffect(() => {
    setDate(initialDate ?? '');
  }, [initialDate]);
  React.useEffect(() => {
    setTitle(initialTitle ?? '');
  }, [initialTitle]);
  React.useEffect(() => {
    setContent(initialContent ?? '');
  }, [initialContent]);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
        <div style={{ width: 'fit-content' }}>
          <input
            type="date"
            className="ui-input"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              onDateChange?.(e.target.value);
            }}
          />
        </div>
        <div style={{ width: '100%' }}>
          <TextEditor
            label="" // 변경: label prop 빈 문자열로 설정
            placeholder="제목을 입력하세요"
            maxLength={30}
            rows={1}
            value={title}
            onChange={(v) => {
              setTitle(v);
              onTitleChange?.(v);
            }}
            style={{
              resize: 'none',
              overflow: 'hidden',
              height: 'auto', // 높이 자동 조절
              minHeight: '38px', // 최소 높이 설정 (대략 한 줄 높이)
              lineHeight: '20px', // 줄 간격 설정
              padding: '8px 12px', // 패딩 조정
            }}
          />
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <TextEditor
          label="" // 변경: label prop 빈 문자열로 설정
          placeholder="내용을 입력하세요"
          maxLength={500} // 변경: 500자 제한
          value={content}
          onChange={(v) => {
            setContent(v);
            onContentChange?.(v);
          }}
        />
      </div>
      <div style={{ width: '100%' }}>
        {initialImageUrl && images.length === 0 ? (
          <div className="ui-thumb" style={{ height: 120 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={initialImageUrl} alt="기존 이미지" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : null}
        <ImageUploader
          label="이미지 첨부"
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
        >
          취소
        </button>
        <button
          type="button"
          className="ui-button primary"
          onClick={() => {
            if (!date) {
              alert('날짜를 선택해주세요.');
              return;
            }
            if (!title.trim()) {
              alert('제목을 입력해주세요.');
              return;
            }
            if (!content.trim()) {
              alert('내용을 입력해주세요.');
              return;
            }
            onSubmit?.(date, title, content, images);
          }}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
