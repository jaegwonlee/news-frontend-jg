import React from 'react';

interface ContentSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  contentClassName?: string;
}

export default function ContentSection({ title, icon, children, className, action, contentClassName = 'p-4' }: ContentSectionProps) {
  return (
    <div className={`flex flex-col bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/80 rounded-xl shadow-lg ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-zinc-700/80">
        <div className="flex items-center gap-3">
          <div className="text-red-500">
            {icon}
          </div>
          <h2 className="font-bold text-lg text-zinc-100">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      
      <div className={`${contentClassName} flex-1`}>
        {children}
      </div>
    </div>
  );
}
