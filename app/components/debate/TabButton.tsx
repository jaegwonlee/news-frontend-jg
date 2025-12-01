"use client";

import { cn } from '@/lib/utils';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export type Stance = 'LEFT' | 'CENTER' | 'RIGHT';

export const stanceConfig = {
    LEFT: { label: "진보", color: "blue", Icon: AlignLeft },
    CENTER: { label: "중도", color: "gray", Icon: AlignCenter },
    RIGHT: { label: "보수", color: "red", Icon: AlignRight },
};

interface TabButtonProps {
    stance: Stance;
    activeStance: Stance;
    onClick: (stance: Stance) => void;
}

export default function TabButton({ stance, activeStance, onClick }: TabButtonProps) {
    const config = stanceConfig[stance];
    const isActive = activeStance === stance;
    return (
        <button
            onClick={() => onClick(stance)}
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
