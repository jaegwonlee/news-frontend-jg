'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface ContentSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
    collapsibleContent?: {
      title: string;
      summary: string;
      published_at?: string;
      buttonText?: string; // Add this prop
    };
    fillHeight?: boolean; // Add new prop
  }
  
  export default function ContentSection({
    title,
    icon,
    children,
    className,
    action,
    collapsibleContent,
    fillHeight = false // Default to false
  }: ContentSectionProps) {
    const [isContentOpen, setIsContentOpen] = useState(false);
  
    const baseClasses = "bg-zinc-900 p-4 rounded-lg";
    const layoutClasses = fillHeight ? "flex flex-col" : "";
  
    return (
      <section className={`${baseClasses} ${layoutClasses} ${className}`}>
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-700 shrink-0">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          
          {action ? (
            <div>{action}</div>
          ) : collapsibleContent ? (
            <div>
              <button 
                onClick={() => setIsContentOpen(!isContentOpen)}
                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <Info className="w-4 h-4" />
                {collapsibleContent.buttonText || '주제 보기'} {/* Use new prop or default */}
              </button>
            </div>
          ) : null}      </div>
      
      {fillHeight ? (
        <div className="flex-1 min-h-0 relative"> {/* Add relative positioning */}
          {collapsibleContent && (
            <div className={`absolute top-0 left-0 right-0 z-10 p-4 ${isContentOpen ? 'block' : 'hidden'}`}> {/* Absolutely positioned overlay */}
              <div className="p-4 bg-zinc-800 rounded-md border border-zinc-700 shadow-lg">
                <h3 className="font-bold text-lg text-white mb-2">{collapsibleContent.title}</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">{collapsibleContent.summary}</p>
                {collapsibleContent.published_at && (
                  <div className="text-right text-xs text-zinc-400 mt-4">
                    <time dateTime={collapsibleContent.published_at}>
                      {formatRelativeTime(collapsibleContent.published_at)}
                    </time>
                  </div>
                )}
              </div>
            </div>
          )}
          {children}
        </div>
      ) : (
        <div>{children}</div>
      )}
    </section>
  );
}
