import { SearchResult } from "@/hooks/useChatSearch";
import { MEDIA_EXTENSIONS, S3_URL_PREFIX } from "@/lib/constants";
import { Message } from "@/types";
import React from "react";
import ArticleCard from "./ArticleCard";
import MediaRenderer from "./common/MediaRenderer";
import TopicPreviewCard from "./debate/TopicPreviewCard";
import UrlRenderer from "./common/UrlRenderer";

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
  const trimmedMessage = msg.message.trim();

  // --- 1. Handle media-only messages (these don't have text + card) ---
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
  try {
    const parsedUrl = new URL(trimmedMessage);
    if (
      trimmedMessage.startsWith(S3_URL_PREFIX) ||
      MEDIA_EXTENSIONS.some((ext) => parsedUrl.pathname.toLowerCase().endsWith(ext))
    ) {
      isMediaUrl = true;
    }
  } catch (_e) { /* Not a valid URL format */ }

  if (isMediaUrl) {
    return (
      <MediaRenderer
        url={trimmedMessage}
        onZoom={onZoom}
        onDownload={onDownload}
        isDownloading={isDownloadingUrl === trimmedMessage}
      />
    );
  }

  // --- 2. For all other messages, prepare for combined rendering ---
  
  // Helper to determine if we should try a client-side render for a plain URL.
  const getClientRenderUrl = (): string | null => {
    // Don't render if a backend preview already exists
    if (msg.topic_preview || msg.article_preview) return null;

    const urlRegex = /^(https?:\/\/[^\s]+)$/;
    if (urlRegex.test(trimmedMessage)) {
      try {
        const url = new URL(trimmedMessage);
        // Only render for external URLs
        if (!url.hostname.endsWith('vercel.app') && !['localhost', '127.0.0.1'].includes(url.hostname)) {
          return trimmedMessage;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  };
  
  const clientRenderUrl = getClientRenderUrl();
  
  // Determine the URL that a preview card would represent, if any.
  let urlFromPreview: string | null = null;
  if (msg.topic_preview) {
    urlFromPreview = `/debate/${msg.topic_preview.id}`;
  } else if (msg.article_preview) {
    urlFromPreview = msg.article_preview.url;
  } else if (clientRenderUrl) {
    urlFromPreview = clientRenderUrl;
  }

  // Show the text bubble only if the message content is not identical to a URL being previewed.
  const showTextBubble = trimmedMessage && trimmedMessage !== urlFromPreview;

  const bubbleClass = isMyMessage
    ? "bg-blue-500 text-white rounded-2xl shadow-sm"
    : "bg-card text-foreground rounded-2xl shadow-sm border border-border";

  return (
    <>
      {/* Part 1: Render the text bubble if applicable */}
      {showTextBubble && (
        <div className={`px-4 py-2 shadow-sm max-w-[280px] sm:max-w-sm break-words ${bubbleClass}`}>
          {highlightText(trimmedMessage, searchQuery, searchResult)}
        </div>
      )}

      {/* Part 2: Render backend-provided previews */}
      {msg.topic_preview && <TopicPreviewCard topic={msg.topic_preview} />}
      
      {msg.article_preview && (
        <div className="mt-2 w-80">
          <ArticleCard article={msg.article_preview} variant="chat" />
        </div>
      )}
      
      {/* Part 3: Render client-side preview if no backend preview exists */}
      {clientRenderUrl && (
        <UrlRenderer url={clientRenderUrl} />
      )}
    </>
  );
}
