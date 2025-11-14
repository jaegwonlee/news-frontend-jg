import { getCategoryNews } from '@/lib/api/articles';
import CategoryNewsClientPage from '@/app/components/CategoryNewsClientPage';

// This is now a Server Component
export default async function CulturePage() {
  const categoryName = "문화";
  // Fetch data on the server
  const articles = await getCategoryNews(categoryName, 50);

  return <CategoryNewsClientPage articles={articles} categoryName={categoryName} />;
}