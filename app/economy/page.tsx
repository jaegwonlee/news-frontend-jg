import { getCategoryNews } from '@/lib/api/articles';
import CategoryNewsClientPage from '@/app/components/CategoryNewsClientPage';

// This is now a Server Component
export default async function EconomyPage() {
  const categoryName = "경제";
  // Fetch data on the server
  const articles = await getCategoryNews(categoryName);

  return <CategoryNewsClientPage articles={articles} categoryName={categoryName} />;
}