'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Globe } from 'lucide-react';

interface FaviconProps {
  src: string;
  alt: string;
  size?: number;
}

const Favicon = ({ src, alt, size = 16 }: FaviconProps) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (error || !src) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
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
      className="rounded"
      onError={() => setError(true)}
    />
  );
};

export default Favicon;
