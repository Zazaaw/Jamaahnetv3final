import React from 'react';

export function IslamicPattern({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 opacity-5 ${className}`}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="islamic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M50 0 L75 25 L50 50 L25 25 Z M0 25 L25 50 L0 75 L-25 50 Z M100 25 L125 50 L100 75 L75 50 Z M50 50 L75 75 L50 100 L25 75 Z" 
              fill="currentColor" 
              opacity="0.3"/>
            <circle cx="50" cy="50" r="3" fill="currentColor"/>
            <circle cx="0" cy="0" r="3" fill="currentColor"/>
            <circle cx="100" cy="0" r="3" fill="currentColor"/>
            <circle cx="0" cy="100" r="3" fill="currentColor"/>
            <circle cx="100" cy="100" r="3" fill="currentColor"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
      </svg>
    </div>
  );
}

export function IslamicBorder({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="islamic-border" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M20 0 L30 10 L20 20 L10 10 Z" fill="currentColor" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="8" fill="url(#islamic-border)" />
        <rect y="calc(100% - 8px)" width="100%" height="8" fill="url(#islamic-border)" />
      </svg>
    </div>
  );
}

export function MosqueIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14 6H10L12 2Z" fill="currentColor"/>
      <path d="M5 8C5 6.89543 5.89543 6 7 6H17C18.1046 6 19 6.89543 19 8V10H5V8Z" fill="currentColor"/>
      <path d="M4 10H20V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V10Z" fill="currentColor" opacity="0.8"/>
      <rect x="10" y="14" width="4" height="8" fill="currentColor" opacity="0.6"/>
      <circle cx="2" cy="8" r="1.5" fill="currentColor"/>
      <circle cx="22" cy="8" r="1.5" fill="currentColor"/>
    </svg>
  );
}
