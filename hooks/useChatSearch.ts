import { useState, useEffect, useCallback } from 'react';

type SearchResult = {
    messageId: number;
    matchIndex: number;
};

import { Message } from '@/types';

export function useChatSearch(messages: Message[], messageRefs: React.RefObject<Map<number, HTMLDivElement>>) {
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);

    useEffect(() => {
        if (!searchQuery || messages.length === 0) {
            setSearchResults([]);
            setCurrentResultIndex(-1);
            return;
        }

        const results: SearchResult[] = [];
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$& ");
        const regex = new RegExp(escapedQuery, "gi");

        messages.forEach((msg) => {
            let matchCount = 0;
            msg.message.replace(regex, () => {
                results.push({ messageId: msg.id, matchIndex: matchCount });
                matchCount++;
                return ""; // Required by .replace
            });
        });

        setSearchResults(results);
        setCurrentResultIndex(results.length > 0 ? 0 : -1);
    }, [searchQuery, messages]);

    const scrollToResult = useCallback((result: SearchResult | undefined) => {
        if (!result) return;
        const messageEl = messageRefs.current?.get(result.messageId);
        messageEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [messageRefs]);

    useEffect(() => {
        if (isSearchVisible && currentResultIndex >= 0 && searchResults[currentResultIndex]) {
            scrollToResult(searchResults[currentResultIndex]);
        }
    }, [isSearchVisible, currentResultIndex, searchResults, scrollToResult]);

    const handleNavigateResult = (direction: "next" | "prev") => {
        if (searchResults.length === 0) return;
        const nextIndex = direction === "next" 
            ? (currentResultIndex + 1) % searchResults.length 
            : (currentResultIndex - 1 + searchResults.length) % searchResults.length;
        setCurrentResultIndex(nextIndex);
    };

    const closeSearch = () => {
        setIsSearchVisible(false);
        setSearchQuery("");
    };

    return {
        isSearchVisible,
        setIsSearchVisible,
        searchQuery,
        setSearchQuery,
        searchResults,
        currentResultIndex,
        handleNavigateResult,
        closeSearch,
    };
}