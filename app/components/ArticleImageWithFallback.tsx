'use client';

import { useState, useEffect } from "react";
import { ImageProps } from "next/image";

interface ArticleImageWithFallbackProps extends Omit<ImageProps, 'src' | 'width' | 'height'> {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: boolean;
}

export default function ArticleImageWithFallback({ 
  src, 
  alt, 
  className,
  style,
  fill,
}: ArticleImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    if (!src) {
      setImgSrc('/user-placeholder.svg');
      return;
    }

    // Optimistically set the new src. If it fails, the onerror will correct it.
    setImgSrc(src);

    const image = new window.Image();
    image.src = src;
    image.onerror = () => {
      setImgSrc('/user-placeholder.svg');
    };
  }, [src]);

  const finalStyle = {
    ...style,
    backgroundImage: `url(${imgSrc})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  // If fill is true, add classes to make the div fill its relative parent
  const fillClasses = fill ? 'absolute inset-0' : '';

  return (
    <div 
      className={`${className || ''} ${fillClasses}`} 
      style={finalStyle} 
      role="img" 
      aria-label={alt}
    ></div>
  );
}
