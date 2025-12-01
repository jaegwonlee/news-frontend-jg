// app/components/profile/ProfileActivity.tsx
'use client';

import { useSavedArticlesManager } from '@/hooks/useSavedArticles';
import { Bookmark } from 'lucide-react';

export default function ProfileActivity() {
  const { articles: savedArticles } = useSavedArticlesManager();

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between p-4 bg-card/70 rounded-lg border border-border">
        <div className="flex items-center gap-4">
          <Bookmark className="w-6 h-6 text-blue-400" />
          <span className="font-semibold text-white text-lg">저장한 기사</span>
        </div>
        <span className="font-bold text-2xl text-blue-400">{savedArticles.length}</span>
      </div>
    </div>
  );
}
