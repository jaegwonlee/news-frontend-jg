'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import CommentSection from './CommentSection';
import { Article } from '@/types';

interface CommentSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
  side: 'left' | 'right';
}

export default function CommentSidePanel({ isOpen, onClose, article, side }: CommentSidePanelProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const panelClasses = `
    absolute inset-0 bg-zinc-900 z-20 flex flex-col
    transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : (side === 'left' ? '-translate-x-full' : 'translate-x-full')}
  `;

  if (!article) return null;

  return (
    <div className={panelClasses}>
      <div className="flex justify-between items-center p-4 border-b border-zinc-700 shrink-0">
        <div className="flex flex-col overflow-hidden">
          <h2 className="text-lg font-bold text-white">댓글</h2>
          <p className="text-sm text-zinc-400 truncate">{article.title}</p>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white shrink-0 ml-4">
          <X size={24} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <CommentSection articleId={article.id} />
      </div>
    </div>
  );
}
