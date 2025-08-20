'use client';

import { useState } from 'react';
import { ImageUploader, TextEditor, VideoUploader, Scrollable, HistoryInput, PersonCard } from '@/components';

export default function ComponentsDemoPage() {
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [text, setText] = useState('');
  const [historyDate, setHistoryDate] = useState('');
  const [historyTitle, setHistoryTitle] = useState('');
  const [historyContent, setHistoryContent] = useState('');
  const [historyImages, setHistoryImages] = useState<File[]>([]);

  return (
    <div className="ui-container">
      <div className="ui-section-title">
        <h2>컴포넌트 데모</h2>
        <p>학교 테마 기반 UI와 공통 컴포넌트들을 한 화면에서 확인하세요.</p>
      </div>

      <div className="ui-grid">
        <div className="ui-col-6">
          <div className="ui-card">
            <ImageUploader onChange={setImages} maxFiles={8} />
          </div>
        </div>

        <div className="ui-col-6">
          <div className="ui-card">
            <VideoUploader onChange={setVideos} maxFiles={3} />
            <div style={{ marginTop: 12 }}>
              <span className="ui-badge">영상 {videos.length}개 선택됨</span>
            </div>
          </div>
        </div>

        <div className="ui-col-12">
          <div className="ui-card">
            <TextEditor label="설명" value={text} onChange={setText} rows={8} />
          </div>
        </div>

        <div className="ui-col-12">
          <div className="ui-card">
            <div className="ui-section-title" style={{ marginTop: 0 }}>
              <h2>학교 연혁 입력</h2>
              <p>새로운 학교 연혁을 입력합니다.</p>
            </div>
            <HistoryInput
              onDateChange={setHistoryDate}
              onTitleChange={setHistoryTitle}
              onContentChange={setHistoryContent}
              onImageChange={setHistoryImages}
            />
            <div style={{ marginTop: '12px' }}>
              <span className="ui-badge">날짜: {historyDate}</span>
              <span className="ui-badge">제목: {historyTitle}</span>
              <span className="ui-badge">내용 길이: {historyContent.length}</span>
              <span className="ui-badge">이미지 {historyImages.length}개</span>
            </div>
          </div>
        </div>

        <div className="ui-col-12">
          <div className="ui-card">
            <div className="ui-section-title" style={{ marginTop: 0 }}>
              <h2>인물 카드</h2>
              <p>년도, 사진, 이름을 포함하는 카드 컴포넌트입니다.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <PersonCard
                year="2024"
                name="김철수"
                imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                onClick={() => alert('김철수 카드 클릭됨')}
              />
              <PersonCard
                year="2023"
                name="이영희"
                imageUrl="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
                onClick={() => alert('이영희 카드 클릭됨')}
              />
              <PersonCard
                year="2022"
                name="박민수"
                onClick={() => alert('박민수 카드 클릭됨')}
              />
              <PersonCard
                year="2021"
                name="최은정"
                imageUrl="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
                onClick={() => alert('최은정 카드 클릭됨')}
              />
            </div>
          </div>
        </div>

        <div className="ui-col-12">
          <div className="ui-card">
            <div className="ui-section-title" style={{ marginTop: 0 }}>
              <h2>스크롤 영역</h2>
              <p>공지, 규정, 안내문 등의 긴 텍스트를 스크롤 가능합니다.</p>
            </div>
            <Scrollable maxHeight={240}>
              <div style={{ display: 'grid', gap: 12 }}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <p key={i}>
                    {i + 1}. 학교 알림 예시 문단입니다. 학사 일정, 급식 안내, 행사 공지 등을 여기에 표시할 수 있습니다.
                  </p>
                ))}
              </div>
            </Scrollable>
          </div>
        </div>
      </div>
    </div>
  );
}


