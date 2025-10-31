
import { Article } from "@/types";
import { BACKEND_BASE_URL } from "@/lib/constants";

/**
 * [속보] 기사 목록을 가져옵니다 (10개)
 */
export async function getBreakingNews(): Promise<Article[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/articles/breaking?limit=10&offset=0`, {
      next: { revalidate: 300 } // 5분마다 캐시 갱신
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch breaking news:", error);
    return [];
  }
}

/**
 * [단독] 기사 목록을 가져옵니다 (10개)
 */
export async function getExclusiveNews(): Promise<Article[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/articles/exclusives?limit=10&offset=0`, { 
      next: { revalidate: 300 } // 5분마다 캐시 갱신
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch exclusive news:", error);
    return [];
  }
}

/**
 * 특정 카테고리의 뉴스 목록을 가져옵니다.
 */
export async function getCategoryNews(categoryName: string, limit: number = 10, token?: string): Promise<Article[]> {
  const encodedCategoryName = encodeURIComponent(categoryName);
  const apiUrl = `${BACKEND_BASE_URL}/api/articles/by-category?name=${encodedCategoryName}&limit=${limit}&offset=0`;
  const headers: HeadersInit = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: headers
    });
    if (!response.ok) {
      throw new Error(`API 호출 실패 (${categoryName}): ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`${categoryName} 뉴스 로드 실패:`, error);
    return [];
  }
}

/**
 * 여러 카테고리의 최신 뉴스를 종합하여 시간순으로 정렬 후 반환합니다.
 */
export async function getLatestNews(limit: number = 10, token?: string): Promise<Article[]> {
  try {
    const categories = ["정치", "경제", "사회", "문화"];
    const promises = categories.map((category) => getCategoryNews(category, limit, token));
    const results = await Promise.all(promises);

    const allArticles = results.flat();
    
    const uniqueArticlesMap = new Map<number, Article>();
    allArticles.forEach((article) => {
      uniqueArticlesMap.set(article.id, article);
    });
    
    const uniqueArticles = Array.from(uniqueArticlesMap.values());
    uniqueArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error("최신 뉴스 종합 실패:", error);
    return [];
  }
}

/**
 * 검색어(q)를 받아 제목과 설명에서 일치하는 기사를 최신순으로 검색합니다.
 */
export async function getSearchArticles(q: string, token?: string): Promise<Article[]> {
  const encodedQuery = encodeURIComponent(q);
  const headers: HeadersInit = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${BACKEND_BASE_URL}/api/search?q=${encodedQuery}`, {
    method: 'GET',
    headers: headers,
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error('검색 결과를 가져오는데 실패했습니다.');
  }

  return response.json();
}

/**
 * 사용자가 특정 기사에 대해 '좋아요'를 누르거나, 이미 누른 '좋아요'를 취소합니다.
 */
export async function toggleArticleLike(token: string, articleId: number, currentIsLiked: boolean): Promise<{ data: { articleId: number; likes: number; isLiked: boolean } }> {
  const method = currentIsLiked ? 'DELETE' : 'POST';
  const response = await fetch(`${BACKEND_BASE_URL}/api/articles/${articleId}/like`, {
    method: method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '좋아요 상태 업데이트에 실패했습니다.');
  }

  return response.json();
}

/**
 * 인기 기사 목록을 가져옵니다.
 */
export async function getPopularNews(category?: string, token?: string): Promise<Article[]> {
  const url = new URL(`${BACKEND_BASE_URL}/api/articles/popular`);
  if (category) {
    url.searchParams.append('category', category);
  }

  const headers: HeadersInit = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url.toString(), {
      cache: 'no-store',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패 (인기 기사): ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('인기 기사 로드 실패:', error);
    return [];
  }
}
