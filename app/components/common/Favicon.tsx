'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Globe } from 'lucide-react';

interface FaviconProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

const Favicon = ({ src, alt, size = 16, className }: FaviconProps) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    // setError(false); // Removed to avoid set-state-in-effect
  }, [src]);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <Globe size={size * 0.8} className="text-muted-foreground" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded ${className}`}
      onError={() => setError(true)}
      unoptimized={src.includes('google.com/s2/favicons')}
    />
  );
};

export default Favicon;
