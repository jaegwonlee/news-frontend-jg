'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

interface ContentSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  collapsibleContent?: {
    title: string;
    summary: string;
  };
}

export default function ContentSection({ 
  title, 
  icon, 
  children, 
  className, 
  collapsibleContent 
}: ContentSectionProps) {
  const [isContentOpen, setIsContentOpen] = useState(false);

  return (
    <section className={`bg-zinc-900 p-4 rounded-lg ${className}`}>
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        {collapsibleContent && (
          <div>
            <button 
              onClick={() => setIsContentOpen(!isContentOpen)}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <Info className="w-4 h-4" />
              주제 보기
            </button>
          </div>
        )}
      </div>
      
      {collapsibleContent && (
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isContentOpen ? 'max-h-96 mb-4' : 'max-h-0'}`}>
          <div className="p-4 bg-zinc-800 rounded-md border border-zinc-700">
            <h3 className="font-bold text-lg text-white mb-2">{collapsibleContent.title}</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">{collapsibleContent.summary}</p>
          </div>
        </div>
      )}

      {children}
    </section>
  );
}