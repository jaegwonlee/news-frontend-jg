"use client";

import { SearchResult } from "@/hooks/useChatSearch";
import { MEDIA_EXTENSIONS, S3_URL_PREFIX } from "@/lib/constants";
import { Message } from "@/types";
import React from "react";
import ArticleCard from "./ArticleCard";
import MediaRenderer from "./common/MediaRenderer";

interface MessageRendererProps {
  msg: Message;
  onZoom: (url: string) => void;
  onDownload: (url: string, filename: string) => Promise<void>;
  isDownloadingUrl: string | null;
  searchResult: SearchResult | null;
  searchQuery: string;
  isMyMessage: boolean; // Added
  isDarkMode: boolean; // Added
}

function highlightText(text: string, query: string, searchResult: SearchResult | null) {
  if (!query || text.trim() === "") return text;

  const escapedQuery = query.replace(/[.*+?^${}()|[\\]/g, "\\$& ");
  const regex = new RegExp(escapedQuery, "gi");
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let matchCount = 0; // To keep track of the current match index

  text.replace(regex, (match, index) => {
    if (index > lastIndex) {
      parts.push(text.substring(lastIndex, index));
    }
    if (searchResult && matchCount === searchResult.matchIndex) {
      parts.push(
        <mark key={`mark-${index}`} className="bg-yellow-400 text-black rounded px-0.5">
          {match}
        </mark>
      );
    } else {
      parts.push(match); // Render non-highlighted match if not the target
    }
    matchCount++;
    lastIndex = index + match.length;
    return match;
  });

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
}

export default function MessageRenderer({
  msg,
  onZoom,
  onDownload,
  isDownloadingUrl,
  searchResult,
  searchQuery,
  isMyMessage,
  isDarkMode,
}: MessageRendererProps) {
  // 1. If backend provides an article preview, render it immediately.
  if (msg.article_preview) {
    // We can wrap it or style it to fit better in the chat context
    return (
      <div className="mt-2">
        <ArticleCard article={msg.article_preview} variant="chat" />
      </div>
    );
  }

  const trimmedMessage = msg.message.trim();

  // 2. Check for media-only messages (uploaded files or direct media links)
  const isBareMediaFilename =
    !trimmedMessage.startsWith("http") &&
    !trimmedMessage.includes("/") &&
    MEDIA_EXTENSIONS.some((ext) => trimmedMessage.toLowerCase().endsWith(ext));

  if (isBareMediaFilename) {
    const fullUrl = S3_URL_PREFIX + trimmedMessage.replace(/ /g, "%20");
    return (
      <MediaRenderer
        url={fullUrl}
        onZoom={onZoom}
        onDownload={onDownload}
        isDownloading={isDownloadingUrl === fullUrl}
      />
    );
  }

  let isMediaUrl = false;
  let parsedUrl: URL | undefined;

  // Attempt to parse as URL regardless of spaces, new URL() will handle encoding/decoding
  try {
    parsedUrl = new URL(trimmedMessage);
    if (
      trimmedMessage.startsWith(S3_URL_PREFIX) ||
      MEDIA_EXTENSIONS.some((ext) => parsedUrl!.pathname.toLowerCase().endsWith(ext))
    ) {
      isMediaUrl = true;
    }
  } catch (_e) {
    /* Not a valid URL format */
  }

  if (isMediaUrl && parsedUrl) {
    return (
      <MediaRenderer
        url={trimmedMessage}
        onZoom={onZoom}
        onDownload={onDownload}
        isDownloading={isDownloadingUrl === trimmedMessage}
      />
    );
  }

  // 3. Render plain text with highlighting
  const bubbleClass = isMyMessage
    ? "bg-blue-500 text-white rounded-2xl rounded-tr-none shadow-sm"
    : isDarkMode
    ? "bg-zinc-700 text-white rounded-2xl rounded-tl-none shadow-sm"
    : "bg-white text-gray-900 border border-gray-200 shadow-sm rounded-2xl rounded-tl-none";

  return (
    <div className={`px-4 py-2 shadow-sm max-w-[280px] sm:max-w-sm break-words ${bubbleClass}`}>
      {highlightText(trimmedMessage, searchQuery, searchResult)}
    </div>
  );
}
