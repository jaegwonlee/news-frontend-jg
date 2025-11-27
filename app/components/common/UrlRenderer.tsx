"use client";

import { useLinkMetadata } from "@/hooks/useLinkMetadata";
import { Skeleton } from "./Skeleton";
import ArticleCard from "../ArticleCard";
import { Article } from "@/types";

export default function UrlRenderer({ url }: { url: string }) {
    const { metadata, isLoading, error } = useLinkMetadata(url);

    if (isLoading) {
        return (
            <div className="mt-2 max-w-sm rounded-lg border border-border bg-background p-3">
                <Skeleton className="h-24 w-full mb-3" />
                <Skeleton className="h-4 w-2/4" />
                <Skeleton className="mt-2 h-3 w-full" />
            </div>
        );
    }

    if (error || !metadata || !metadata.image || !metadata.title) {
        // If we can't get a rich preview, just show the link
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {url}
            </a>
        );
    }

    // Adapt the generic metadata to the Article type to render an ArticleCard
    const pseudoArticle: Article = {
        id: 0, // No real ID from generic metadata
        url: url,
        title: metadata.title,
        thumbnail_url: metadata.image,
        favicon_url: metadata.favicon || null,
        source: new URL(url).hostname,
        source_domain: new URL(url).hostname,
        published_at: new Date().toISOString(), // No real date from generic metadata
        description: metadata.description,
        comment_count: 0,
        like_count: 0,
    };

    return <ArticleCard article={pseudoArticle} />;
}
