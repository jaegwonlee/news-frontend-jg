import React from "react";
import Image from "next/image";
import { LinkMetadata } from "@/types";

interface LinkPreviewCardProps extends LinkMetadata {}

const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({ url, title, description, image, favicon }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-3 p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
    >
      {image && (
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image src={image} alt="Link preview image" layout="fill" objectFit="cover" className="rounded-md" />
        </div>
      )}
      <div className="flex-grow">
        {title && <p className="text-sm font-medium text-foreground line-clamp-2">{title}</p>}
        {description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{description}</p>}
        <div className="flex items-center mt-2">
          {favicon && <Image src={favicon} alt="Favicon" width={16} height={16} className="mr-1" />}
          <span className="text-xs text-primary truncate">{new URL(url).hostname}</span>
        </div>
      </div>
    </a>
  );
};

export default LinkPreviewCard;
