"use client";

import React from "react";
import { Article, Message } from "@/types";
import MediaRenderer from "./common/MediaRenderer";
import UrlRenderer from "./common/UrlRenderer";
import ChatArticleCard from "./ChatArticleCard";
import { S3_URL_PREFIX, MEDIA_EXTENSIONS } from "@/lib/constants";

interface MessageRendererProps {
  msg: Message;
  articles: Article[];
  onZoom: (url: string) => void;
  onDownload: (url: string, filename: string) => Promise<void>;
  isDownloadingUrl: string | null;
  searchResult: { messageId: number; matchIndex: number; } | null;
  searchQuery: string;
  isMyMessage: boolean;
  isDarkMode: boolean;
}

const URL_REGEX = /(https?:\[^\]+)/g;

function highlightText(text: string, query: string) {
  if (!query || text.trim() === '') return text;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$& ");
  const regex = new RegExp(escapedQuery, "gi");
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  text.replace(regex, (match, index) => {
    if (index > lastIndex) {
      parts.push(text.substring(lastIndex, index));
    }
    parts.push(
      <mark key={`mark-${index}`} className="bg-yellow-400 text-black rounded px-0.5">
        {match}
      </mark>
    );
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
  articles, 
  onZoom, 
  onDownload, 
  isDownloadingUrl, 
  searchResult, // Note: searchResult is not used in highlightText, simplifying for now
  searchQuery,
  isMyMessage,
  isDarkMode
}: MessageRendererProps) {
  const trimmedMessage = msg.message.trim();

  // --- 1. Determine Content Type ---
  let isMediaOnly = false;
  let content: React.ReactNode;

  const isBareMediaFilename =
    !trimmedMessage.startsWith("http") &&
    !trimmedMessage.includes("/") &&
    MEDIA_EXTENSIONS.some(ext => trimmedMessage.toLowerCase().endsWith(ext));

  let isSingleUrl = !trimmedMessage.includes(" ");
  let isSingleMediaUrl = false;
  let isSingleArticleUrl = false;
  let article: Article | undefined;

  if (isSingleUrl) {
    try {
      const url = new URL(trimmedMessage); // This will throw if not a full URL
      if (trimmedMessage.startsWith(S3_URL_PREFIX) || MEDIA_EXTENSIONS.some(ext => url.pathname.toLowerCase().endsWith(ext))) {
        isSingleMediaUrl = true;
      } else {
        article = articles.find(a => a.url === trimmedMessage);
        if (article) isSingleArticleUrl = true;
      }
    } catch (e) { /* Not a full URL */ } 
  }
  
  if (isBareMediaFilename || isSingleMediaUrl) {
    isMediaOnly = true;
    const fullUrl = isBareMediaFilename 
      ? S3_URL_PREFIX + trimmedMessage.replace(/ /g, "%20") 
      : trimmedMessage;
    content = <MediaRenderer url={fullUrl} onZoom={onZoom} onDownload={onDownload} isDownloading={isDownloadingUrl === fullUrl} />;
  } else if (isSingleArticleUrl && article) {
    isMediaOnly = true; // Render article cards without a bubble as well
    content = <ChatArticleCard article={article} />;
  } else {
    // --- 3. Parse for mixed content ---
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    trimmedMessage.replace(URL_REGEX, (match, url, index) => {
      if (index > lastIndex) {
        parts.push(highlightText(trimmedMessage.substring(lastIndex, index), searchQuery));
      }

      const matchedArticle = articles.find((a) => a.url === url);
      const isMediaUrl = (u: string) => {
        try {
          return MEDIA_EXTENSIONS.some(ext => new URL(u).pathname.toLowerCase().endsWith(ext));
        } catch { return false; }
      };

      if (matchedArticle) {
        parts.push(<ChatArticleCard key={index} article={matchedArticle} />);
      } else if (url.startsWith(S3_URL_PREFIX) || isMediaUrl(url)) {
        parts.push(<MediaRenderer key={index} url={url} onZoom={onZoom} onDownload={onDownload} isDownloading={isDownloadingUrl === url} />);
      } else {
        parts.push(<UrlRenderer key={index} url={url} />);
      }
      lastIndex = index + match.length;
      return match;
    });

    if (lastIndex < trimmedMessage.length) {
      parts.push(highlightText(trimmedMessage.substring(lastIndex), searchQuery));
    }
    
    content = parts.length > 0 ? <>{parts}</> : <>{highlightText(trimmedMessage, searchQuery)}</>;
  }

  // --- 2. Render based on content type ---
  if (isMediaOnly) {
    return content; // Render media/article directly without a bubble
  }

  // It's a text or mixed message, wrap it in a bubble
  const bubbleClasses = isMyMessage
      ? (isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800")
      : (isDarkMode ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-800");

  return (
    <div className={`rounded-2xl wrap-break-word px-3 py-2 max-w-xs lg:max-w-md ${bubbleClasses}`}>
        <div className="text-sm">
            {content}
        </div>
    </div>
  );
}