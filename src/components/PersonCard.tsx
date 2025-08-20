'use client';

import React from 'react';

export interface PersonCardProps {
  year: string | number;
  imageUrl?: string | null;
  name: string;
  className?: string;
  onClick?: () => void;
}

export default function PersonCard({ year, imageUrl, name, className, onClick }: PersonCardProps) {
  return (
    <div 
      className={`ui-card ${className ?? ''}`} 
      style={{ 
        padding: '8px', 
        textAlign: 'center', 
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      {/* 년도 */}
      <div 
        style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          color: 'var(--color-primary)', 
          marginBottom: '8px' 
        }}
      >
        {year}
      </div>
      
      {/* 사진 */}
      <div 
        style={{ 
          width: '180px', 
          height: '240px', 
          margin: '0 auto 8px', 
          borderRadius: '12px', 
          overflow: 'hidden',
          backgroundColor: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid var(--color-border)'
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={imageUrl} 
            alt={name} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
          />
        ) : (
          <div 
            style={{ 
              color: 'var(--color-muted)', 
              fontSize: '96px',
              fontWeight: '300'
            }}
          >
            👤
          </div>
        )}
      </div>
      
      {/* 이름 */}
      <div 
        style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          color: 'var(--color-text)',
          wordBreak: 'keep-all'
        }}
      >
        {name}
      </div>
    </div>
  );
}
