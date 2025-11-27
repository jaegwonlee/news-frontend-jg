"use client";

import { useState } from 'react';
import { Article } from '@/types';
import ArticleCard from '@/app/components/ArticleCard';
import { cn } from '@/lib/utils';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ArticleSidePanelProps {
    articles: Article[];
}

type Stance = 'LEFT' | 'CENTER' | 'RIGHT';

const stanceConfig = {
    LEFT: { label: "진보", color: "blue", Icon: AlignLeft },
    CENTER: { label: "중도", color: "gray", Icon: AlignCenter },
    RIGHT: { label: "보수", color: "red", Icon: AlignRight },
};

export default function ArticleSidePanel({ articles }: ArticleSidePanelProps) {
    const [activeStance, setActiveStance] = useState<Stance>('LEFT');

    const filteredArticles = articles.filter(a => a.side === activeStance);

    const TabButton = ({ stance }: { stance: Stance }) => {
        const config = stanceConfig[stance];
        const isActive = activeStance === stance;
        return (
            <button
                onClick={() => setActiveStance(stance)}
                className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-1 p-3 text-sm font-bold border-b-4 transition-all",
                    isActive
                        ? `text-${config.color}-500 border-${config.color}-500`
                        : "text-muted-foreground border-transparent hover:bg-accent"
                )}
            >
                <config.Icon size={20} />
                <span>{config.label}</span>
            </button>
        );
    };

    return (
        <aside className="sticky top-[80px] h-[calc(100vh-100px)] flex flex-col">
            <div className="bg-card border border-border rounded-lg flex-1 flex flex-col overflow-hidden">
                <div className="flex border-b border-border">
                    <TabButton stance="LEFT" />
                    <TabButton stance="CENTER" />
                    <TabButton stance="RIGHT" />
                </div>
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                    {filteredArticles.length > 0 ? (
                        filteredArticles.map(article => (
                            <ArticleCard key={article.id} article={article} variant="horizontal" />
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground pt-10">
                            <p>해당 성향의 기사가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
