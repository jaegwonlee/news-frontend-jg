import { getCategoryNews } from '@/lib/api';
import { Article } from '@/types';
import ArticleCard from '@/app/components/ArticleCard';
import ContentSection from '../components/common/ContentSection';
import { Newspaper } from 'lucide-react';
import ServerPaginationControls from '@/app/components/common/ServerPaginationControls';

export const dynamic = 'force-dynamic';

const ARTICLES_PER_PAGE = 20;

async function getLatestNews() {
  const categories = ["정치", "경제", "사회", "문화"];
  const newsPromises = categories.map(category => 
    getCategoryNews(category, 50).catch(err => {
      console.error(`Error fetching latest news for category ${category}:`, err);
      return [];
    })
  );

  const results = await Promise.all(newsPromises);
  const allArticles = results.flat();
  
  const uniqueArticlesMap = new Map<number, Article>();
  allArticles.forEach((article) => {
    uniqueArticlesMap.set(article.id, article);
  });

  const sortedArticles = Array.from(uniqueArticlesMap.values())
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  return sortedArticles;
}

export default async function LatestNewsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const allArticles = await getLatestNews();

  const page = searchParams['page'] ?? '1';
  const currentPage = Number(page);

  const totalPages = Math.ceil(allArticles.length / ARTICLES_PER_PAGE);

  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const paginatedArticles = allArticles.slice(startIndex, endIndex);

  return (
    <div className="w-full max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
      <ContentSection title="최신 뉴스" icon={<Newspaper />}>
        {paginatedArticles.length > 0 ? (
          <>
            <div key={currentPage} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            <ServerPaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </>
        ) : (
          <p className="text-center text-zinc-400">최신 뉴스가 없습니다.</p>
        )}
      </ContentSection>
    </div>
  );
}