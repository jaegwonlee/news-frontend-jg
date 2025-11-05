import { Article } from "@/types";
import { fetchWrapper } from "./fetchWrapper";

/**
 * [속보] 기사 목록을 가져옵니다 (10개)
 */
export async function getBreakingNews(): Promise<Article[]> {
  try {
    const res = await fetchWrapper(`/api/articles/breaking?limit=10&offset=0`, {
      next: { revalidate: 300 } // 5분마다 캐시 갱신
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    if ((error as Error).message === 'Session expired') return []; // 세션 만료 시 빈 배열 반환
    console.error("Failed to fetch breaking news:", error);
    return [];
  }
}

/**
 * [단독] 기사 목록을 가져옵니다 (10개)
 */
export async function getExclusiveNews(): Promise<Article[]> {
  try {
    const res = await fetchWrapper(`/api/articles/exclusives?limit=10&offset=0`, { 
      next: { revalidate: 300 } // 5분마다 캐시 갱신
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    if ((error as Error).message === 'Session expired') return [];
    console.error("Failed to fetch exclusive news:", error);
    return [];
  }
}

/**
 * 특정 카테고리의 뉴스 목록을 가져옵니다.
 */
export async function getCategoryNews(categoryName: string, limit: number = 10, token?: string): Promise<Article[]> {
  const encodedCategoryName = encodeURIComponent(categoryName);
  const apiUrl = `/api/articles/by-category?name=${encodedCategoryName}&limit=${limit}&offset=0`;
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const response = await fetchWrapper(apiUrl, {
      cache: "no-store",
      headers: headers
    });
    if (!response.ok) {
      throw new Error(`API 호출 실패 (${categoryName}): ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if ((error as Error).message === 'Session expired') return [];
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
    if ((error as Error).message === 'Session expired') return [];
    console.error("최신 뉴스 종합 실패:", error);
    return [];
  }
}

/**
 * Increments the view count of an article.
 * @param articleId The ID of the article to increment the view count for.
 */
export async function incrementArticleView(articleId: number): Promise<void> {
  try {
    const response = await fetchWrapper(`/api/articles/${articleId}/view`, {
      method: 'POST',
    });
    if (!response.ok) {
      // Don't throw an error, just log it, as it's not a critical failure
      console.error(`Failed to increment view count for article ${articleId}. Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error in incrementArticleView:', error);
  }
}


/**
 * 검색어(q)를 받아 제목과 설명에서 일치하는 기사를 최신순으로 검색합니다.
 */
export async function getSearchArticles(q: string, token?: string): Promise<Article[]> {
  const encodedQuery = encodeURIComponent(q);
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetchWrapper(`/api/search?q=${encodedQuery}`, {
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
  const response = await fetchWrapper(`/api/articles/${articleId}/like`, {
    method: method,
    headers: {
      'Authorization': `Bearer ${token}`,
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
  const fetchByCategory = async (cat: string) => {
    const url = new URL(`/api/articles/popular`, 'http://localhost'); // Base is needed for URL object, but will be replaced by fetchWrapper
    url.searchParams.append('category', cat);
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      const response = await fetchWrapper(url.pathname + url.search, {
        cache: 'no-store',
        headers: headers,
      });
      if (!response.ok) {
        console.error(`API 호출 실패 (인기 기사 - ${cat}): ${response.status}`);
        return [];
      }
      return await response.json();
    } catch (error) {
      if ((error as Error).message === 'Session expired') return [];
      console.error(`인기 기사 로드 실패 (${cat}):`, error);
      return [];
    }
  };

  if (category) {
    return fetchByCategory(category);
  }

  try {
    const categories = ["정치", "경제", "사회", "문화"];
    const promises = categories.map(fetchByCategory);
    const results = await Promise.all(promises);

    const allArticles = results.flat();

    const uniqueArticlesMap = new Map<number, Article>();
    allArticles.forEach((article) => {
      uniqueArticlesMap.set(article.id, article);
    });

    const uniqueArticles = Array.from(uniqueArticlesMap.values());

    uniqueArticles.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));

    return uniqueArticles.slice(0, 20);

  } catch (error) {
    if ((error as Error).message === 'Session expired') return [];
    console.error("전체 인기 뉴스 종합 실패:", error);
    return [];
  }
}

/**
 * 사용자가 특정 기사를 저장하거나, 저장을 취소합니다.
 */
export async function toggleArticleSave(token: string, articleId: number, currentIsSaved: boolean): Promise<any> {
  const method = currentIsSaved ? 'DELETE' : 'POST';
  const response = await fetchWrapper(`/api/articles/${articleId}/save`, {
    method: method,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '기사 저장 상태 업데이트에 실패했습니다.');
  }

  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
}