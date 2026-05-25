import React from 'react';

/**
 * variant: 'primary' | 'secondary'
 * size: 'sm' | 'md' (default)
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  const sz   = size === 'sm' ? 'text-xs px-3 py-2' : '';
  return (
    <button className={`${base} ${sz} ${className}`} {...props}>
      {children}
    </button>
  );
}
