"use client";

import { useState } from "react";
import Image from "next/image";
import { FAVICON_URLS } from "@/lib/constants";

interface ArticleImageWithFallbackProps {
  src: string;
  alt: string;
  sourceDomain: string;
}

export default function ArticleImageWithFallback({ src, alt, sourceDomain }: ArticleImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    const fallbackFavicon = sourceDomain ? FAVICON_URLS[sourceDomain] : undefined;
    setImgSrc(fallbackFavicon || "/user-placeholder.svg");
    console.log("Image failed to load, falling back to:", fallbackFavicon || "/user-placeholder.svg");
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover rounded-md"
      onError={handleError}
      unoptimized={true} // Ensure unoptimized for external URLs
    />
  );
}