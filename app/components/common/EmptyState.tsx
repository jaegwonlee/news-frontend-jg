import { LucideIcon } from 'lucide-react';
import React from 'react';

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-zinc-800/50 rounded-lg border-2 border-dashed border-zinc-700">
      <div className="bg-zinc-700/50 p-4 rounded-full mb-4">
        <Icon className="w-10 h-10 text-zinc-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 max-w-sm">{description}</p>
    </div>
  );
}
