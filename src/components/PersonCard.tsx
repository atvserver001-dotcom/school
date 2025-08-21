'use client';

import React from 'react';
import Image from 'next/image';

export interface PersonCardProps {
  year: string | number;
  imageUrl?: string | null;
  name: string;
  className?: string;
  onClick?: () => void;
  priority?: boolean;
}

export default function PersonCard({ year, imageUrl, name, className, onClick, priority }: PersonCardProps) {
  function toThumbnailUrl(originalUrl: string | null | undefined, width: number = 600, quality: number = 80): string | null {
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
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Image
              fill
              src={toThumbnailUrl(imageUrl, 600, 80) as string}
              alt={name}
              unoptimized={true}
              sizes="(max-width: 640px) 180px, 240px"
              style={{ objectFit: 'cover' }}
              priority={Boolean(priority)}
            />
          </div>
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
