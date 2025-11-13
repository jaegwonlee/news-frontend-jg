import { getCategoryNews } from '@/lib/api/articles';
import { Article } from '@/types';
import CategoryArticleCard from '@/app/components/CategoryArticleCard';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';

// This is now a Server Component
export default async function EconomyPage() {
  const categoryName = "경제";
  const accentColor = "green"; // Accent color for Economy
  // Fetch data on the server
  const articles = await getCategoryNews(categoryName, 50);

  const heroArticle = articles.length > 0 ? articles[0] : null;
  const remainingArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-5xl font-extrabold text-white border-b-4 border-green-500 pb-4 inline-block">
          {categoryName}
        </h1>
      </header>

      {articles.length === 0 ? (
        <div className="text-center text-zinc-400 py-20">
          <p className="text-lg">해당 카테고리에 뉴스가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {heroArticle && (
            <CategoryArticleCard article={heroArticle} layout="hero" accentColor={accentColor} />
          )}
          
          {remainingArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {remainingArticles.map(article => (
                <CategoryArticleCard key={article.id} article={article} layout="default" accentColor={accentColor} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}