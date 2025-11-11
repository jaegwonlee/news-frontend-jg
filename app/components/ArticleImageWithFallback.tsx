"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { FAVICON_URLS } from "@/lib/constants";

// Make the component accept all standard ImageProps, plus our custom 'sourceDomain'
interface ArticleImageWithFallbackProps extends ImageProps {
  sourceDomain?: string;
}

export default function ArticleImageWithFallback({ 
  src, 
  alt, 
  sourceDomain, 
  ...props 
}: ArticleImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    const fallbackFavicon = sourceDomain ? FAVICON_URLS[sourceDomain] : undefined;
    const finalFallback = fallbackFavicon || "/user-placeholder.svg";
    setImgSrc(finalFallback);
    console.log("Image failed to load, falling back to:", finalFallback);
  };

  // If the src is not a string (it could be a StaticImageData object), don't add the onError handler.
  const isExternal = typeof src === 'string';

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || ''} // Ensure alt is always a string
      onError={isExternal ? handleError : undefined}
      unoptimized={isExternal} // Unoptimize only for external string URLs
    />
  );
}