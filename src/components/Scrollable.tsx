'use client';

import { CSSProperties, PropsWithChildren } from 'react';

export interface ScrollableProps {
  height?: number | string;
  maxHeight?: number | string;
  style?: CSSProperties;
  className?: string;
}

export default function Scrollable({
  height,
  maxHeight = 280,
  style,
  className,
  children,
}: PropsWithChildren<ScrollableProps>) {
  const inlineStyle: CSSProperties = {
    height: height === undefined ? undefined : (typeof height === 'number' ? `${height}px` : height),
    maxHeight: maxHeight === undefined ? undefined : (typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight),
    ...style,
  };
  return (
    <div className={`ui-scrollable ${className ?? ''}`} style={inlineStyle}>
      {children}
    </div>
  );
}


