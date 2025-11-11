import Link from 'next/link';
import { Article } from '@/types';
import ArticleImageWithFallback from './ArticleImageWithFallback';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CategoryArticleCardProps {
  article: Article;
  layout?: 'hero' | 'default';
  accentColor?: string;
}

const formatDate = (dateString: string) => {
  const date = parseISO(dateString);
  const now = new Date();
  if (now.getTime() - date.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNow(date, { addSuffix: true, locale: ko });
  }
  return format(date, 'yyyy.MM.dd');
};

const accentColorClasses = {
  blue: {
    border: 'hover:border-blue-500',
    text: 'group-hover:text-blue-400',
  },
  green: {
    border: 'hover:border-green-500',
    text: 'group-hover:text-green-400',
  },
  yellow: {
    border: 'hover:border-yellow-500',
    text: 'group-hover:text-yellow-400',
  },
  purple: {
    border: 'hover:border-purple-500',
    text: 'group-hover:text-purple-400',
  },
};

type AccentColor = keyof typeof accentColorClasses;

export default function CategoryArticleCard({ article, layout = 'default', accentColor = 'blue' }: CategoryArticleCardProps) {
  const colors = accentColorClasses[accentColor as AccentColor] || accentColorClasses.blue;

  if (layout === 'hero') {
    return (
      <Link href={article.url} target="_blank" rel="noopener noreferrer" className="group relative block w-full h-96 rounded-xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0">
          <ArticleImageWithFallback
            src={article.thumbnail_url}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h2 className="text-3xl font-extrabold mb-4 leading-tight drop-shadow-lg">
            {article.title}
          </h2>
          <div className="flex items-center gap-3 text-sm opacity-90">
            <img src={article.favicon_url} alt={`${article.source} favicon`} className="w-5 h-5 rounded-full" />
            <span className="font-semibold">{article.source}</span>
            <span>&bull;</span>
            <span>{formatDate(article.published_at)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={article.url} target="_blank" rel="noopener noreferrer" className={`group block bg-zinc-800/50 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-transparent ${colors.border}`}>
      <div className="relative w-full aspect-video">
        <ArticleImageWithFallback
          src={article.thumbnail_url}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className={`text-lg font-bold text-white mb-3 leading-snug transition-colors ${colors.text}`}>
          {article.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <img src={article.favicon_url} alt={`${article.source} favicon`} className="w-4 h-4 rounded-full" />
          <span className="font-medium truncate">{article.source}</span>
          <span className="mx-1">&bull;</span>
          <span className="flex-shrink-0">{formatDate(article.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}
