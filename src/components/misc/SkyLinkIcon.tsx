import React from 'react';

interface SkyLinkIconProps {
  variant?: 'default' | 'white';
  className?: string;
  size?: number;
}

export default function SkyLinkIcon({ variant = 'default', className = '', size = 24 }: SkyLinkIconProps) {
  const iconPath = variant === 'white' ? '/assets/favicon-white.svg' : '/assets/favicon.svg';
  
  return (
    <img 
      src={iconPath} 
      alt="SkyLink" 
      className={className}
      style={{ 
        width: size, 
        height: size,
        background: 'transparent'
      }}
    />
  );
}
