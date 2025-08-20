'use client';

import { useEffect, useId, useState } from 'react';

export interface TextEditorProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  onChange?: (value: string) => void;
  style?: React.CSSProperties; // New prop
}

export default function TextEditor({
  label = '텍스트',
  value,
  defaultValue = '',
  placeholder = '내용을 입력하세요...',
  rows = 6,
  maxLength = 1000,
  disabled = false,
  onChange,
  style,
}: TextEditorProps) {
  const id = useId();
  const [internal, setInternal] = useState<string>(value ?? defaultValue);

  useEffect(() => {
    if (value !== undefined) setInternal(value);
  }, [value]);

  const currentLength = internal?.length ?? 0;

  return (
    <div>
      {label && (
        <label className="ui-label" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className="ui-textarea"
        placeholder={placeholder}
        rows={rows}
        value={internal}
        maxLength={maxLength}
        disabled={disabled}
        onChange={(e) => {
          setInternal(e.target.value);
          onChange?.(e.target.value);
        }}
        style={style} // Apply style prop
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <span className="ui-badge">
          {currentLength}/{maxLength}
        </span>
      </div>
    </div>
  );
}


