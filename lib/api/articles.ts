/**
 * @file articles.ts
 * @description 기사(Article)와 관련된 모든 백엔드 API 호출을 정의하는 파일입니다.
 * 각 함수는 특정 종류의 기사 데이터를 가져오거나, 기사와 관련된 상호작용(좋아요, 저장)을 처리합니다.
 * 모든 함수는 중앙 집중식 에러 처리 및 요청 관리를 위해 `fetchWrapper`를 사용합니다.
 */

import { Article, ToggleSaveResponse } from "@/types";
import { fetchWrapper } from "./fetchWrapper";
import { mockBreakingNews, mockExclusiveNews, mockAllCategoryNews } from "@/app/mocks/articles";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'; // Set to true to use mock data

/**
 * @function getBreakingNews
 * @description 백엔드에서 '속보'로 분류된 기사 목록을 가져옵니다.
 * @returns {Promise<Article[]>} - 속보 기사 객체의 배열을 반환하는 프로미스. API 실패 시 빈 배열을 반환합니다.
 * @cache Next.js의 Incremental Static Regeneration (ISR)을 사용하여 5분(300초)마다 캐시를 갱신합니다.
 *        이를 통해 빌드 시점에 정적으로 페이지를 생성하고, 주기적으로 최신 데이터로 업데이트할 수 있습니다.
 */
export async function getBreakingNews(): Promise<Article[]> {
  if (USE_MOCKS) {
    return Promise.resolve(mockBreakingNews);
  }
  try {
    const res = await fetchWrapper(`/api/articles/breaking?limit=10&offset=0`, {
      next: { revalidate: 300 } // 5분마다 캐시 갱신
    });
    if (!res.ok) return []; // API 응답이 실패하면 빈 배열 반환
    return await res.json();
  } catch (error) {
    // fetchWrapper에서 'Session expired' 에러를 throw하면, 전역 처리가 이미 되었으므로 빈 배열만 반환합니다.
    if ((error as Error).message === 'Session expired') return [];
    console.error("Failed to fetch breaking news:", error);
    return []; // 그 외 다른 에러 발생 시에도 빈 배열 반환
  }
}

/**
 * @function getExclusiveNews
 * @description 백엔드에서 '단독'으로 분류된 기사 목록을 가져옵니다.
 * @returns {Promise<Article[]>} - 단독 기사 객체의 배열을 반환하는 프로미스. API 실패 시 빈 배열을 반환합니다.
 * @cache 5분(300초) 주기로 ISR을 통해 캐시를 갱신합니다.
 */
export async function getExclusiveNews(): Promise<Article[]> {
  if (USE_MOCKS) {
    return Promise.resolve(mockExclusiveNews);
  }
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
 * @function getCategoryNews
 * @description 특정 카테고리에 해당하는 뉴스 기사 목록을 가져옵니다.
 *              개발 환경에서는 목업 데이터를 사용하고, 프로덕션 환경에서는 실제 API를 호출합니다.
 * @param {string} categoryName - 가져올 뉴스의 카테고리 이름 (예: "정치", "경제").
 * @param {number} [limit=10] - 가져올 기사의 최대 개수.
 * @param {string} [token] - 사용자 인증 토큰. 제공될 경우, 개인화된 데이터를 포함할 수 있습니다.
 * @returns {Promise<Article[]>} - 해당 카테고리의 기사 객체 배열을 반환하는 프로미스.
 */
export async function getCategoryNews(categoryName: string, limit?: number, token?: string): Promise<Article[]> {
  if (USE_MOCKS) {
    const news = mockAllCategoryNews[categoryName] || [];
    return Promise.resolve(limit ? news.slice(0, limit) : news);
  }
  // 프로덕션 환경에서는 실제 API를 호출합니다.
  const encodedCategoryName = encodeURIComponent(categoryName);
  let apiUrl = `/api/articles/by-category?name=${encodedCategoryName}`;
  
  if (limit) {
    apiUrl += `&limit=${limit}`;
  }
  
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetchWrapper(apiUrl, {
      cache: 'no-store', // 데이터가 2MB를 초과하여 캐시 오류가 발생하므로 캐시를 사용하지 않음
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
 * @function getLatestNews
 * @description 여러 주요 카테고리의 최신 뉴스를 모두 가져와 시간순으로 정렬하여 반환합니다.
 * @param {number} [limit=10] - 최종적으로 반환할 기사의 최대 개수.
 * @param {string} [token] - 사용자 인증 토큰.
 * @returns {Promise<Article[]>} - 모든 카테고리를 종합한 최신 기사 객체 배열.
 * @logic
 * 1. 정의된 모든 카테고리("정치", "경제", "사회", "문화")에 대해 `getCategoryNews`를 병렬로 호출합니다.
 * 2. 모든 결과를 하나의 배열로 합칩니다.
 * 3. `Map`을 사용하여 기사 ID를 기준으로 중복된 기사를 제거합니다.
 * 4. 중복이 제거된 기사들을 발행 시간(`published_at`) 기준으로 내림차순(최신순) 정렬합니다.
 * 5. 정렬된 배열에서 `limit` 개수만큼 잘라서 반환합니다.
 */
export async function getLatestNews(limit: number = 10, token?: string): Promise<Article[]> {
  // This function now uses the mocked getCategoryNews, so it will work automatically.
  try {
    const categories = ["정치", "경제", "사회", "문화"];
    const promises = categories.map((category) => getCategoryNews(category, limit, token));
    const results = await Promise.all(promises);

    const allArticles = results.flat(); // 2차원 배열을 1차원 배열로 평탄화
    
    // Map을 이용해 중복 기사 제거 (ID 기준)
    const uniqueArticlesMap = new Map<number, Article>();
    allArticles.forEach((article) => {
      uniqueArticlesMap.set(article.id, article);
    });
    
    const uniqueArticles = Array.from(uniqueArticlesMap.values());
    // 최신순으로 정렬
    uniqueArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    return uniqueArticles.slice(0, limit); // 지정된 개수만큼 잘라서 반환
  } catch (error) {
    if ((error as Error).message === 'Session expired') return [];
    console.error("최신 뉴스 종합 실패:", error);
    return [];
  }
}

/**
 * @function getAllLatestNews
 * @description '최신 뉴스 전체보기' 페이지를 위해, 각 카테고리별로 50개씩 기사를 가져와 종합하고 최신순으로 정렬합니다.
 * @returns {Promise<Article[]>} - 모든 카테고리를 종합한 최신 기사 50개*4=200개 내외의 배열.
 * @logic `getLatestNews`와 유사하지만, 더 많은 기사(카테고리당 50개)를 가져와 페이지네이션 없이 보여주기 위한 목적입니다.
 */
export async function getAllLatestNews(): Promise<Article[]> {
  // This function now uses the mocked getCategoryNews, so it will work automatically.
  const categories = ["정치", "경제", "사회", "문화"];
  const newsPromises = categories.map(category => 
    getCategoryNews(category, 50).catch(err => {
      console.error(`Error fetching latest news for category ${category}:`, err);
      return []; // 특정 카테고리 로드 실패 시에도 전체가 실패하지 않도록 빈 배열 반환
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

/**
 * @function getSearchArticles
 * @description 검색어(query)를 받아 기사 제목과 설명에서 일치하는 기사를 검색하여 최신순으로 반환합니다.
 * @param {string} q - 사용자가 입력한 검색어.
 * @param {string} [token] - 사용자 인증 토큰.
 * @returns {Promise<Article[]>} - 검색 결과에 해당하는 기사 객체 배열.
 * @throws {Error} - API 호출 실패 시 에러를 발생시킵니다.
 * @cache 1분(60초) 주기로 ISR을 통해 캐시를 갱신합니다.
 */
export async function getSearchArticles(q: string, token?: string): Promise<Article[]> {
  if (USE_MOCKS) {
    const allMockArticles = Object.values(mockAllCategoryNews).flat();
    const lowerCaseQuery = q.toLowerCase();
    const results = allMockArticles.filter(article => 
        article.title.toLowerCase().includes(lowerCaseQuery) ||
        article.summary?.toLowerCase().includes(lowerCaseQuery)
    );
    return Promise.resolve(results);
  }
  const encodedQuery = encodeURIComponent(q);
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetchWrapper(`/api/search?q=${encodedQuery}`, {
    method: 'GET',
    headers: headers,
    next: { revalidate: 60 } // 1분마다 캐시 갱신
  });

  if (!response.ok) {
    throw new Error('검색 결과를 가져오는데 실패했습니다.');
  }

  return response.json();
}

/**
 * @function toggleArticleLike
 * @description 사용자가 특정 기사에 '좋아요'를 누르거나 취소하는 기능을 처리합니다.
 * @param {string} token - 사용자 인증 토큰 (필수).
 * @param {number} articleId - '좋아요'를 적용할 기사의 ID.
 * @param {boolean} currentIsLiked - 현재 '좋아요' 상태. true이면 '좋아요'를 취소(DELETE)하고, false이면 '좋아요'를 추가(POST)합니다.
 * @returns {Promise<{ data: { articleId: number; likes: number; isLiked: boolean } }>} - 업데이트된 '좋아요' 정보(기사 ID, 총 좋아요 수, 새로운 '좋아요' 상태)를 포함하는 객체.
 * @throws {Error} - API 호출 실패 시 에러를 발생시킵니다.
 */
export async function toggleArticleLike(token: string, articleId: number, currentIsLiked: boolean): Promise<{ data: { articleId: number; likes: number; isLiked: boolean } }> {
  if (USE_MOCKS) {
    console.log(`Mock toggling like for article ${articleId}. CurrentIsLiked: ${currentIsLiked}`);
    const mockResponse = {
        data: {
            articleId,
            likes: Math.floor(Math.random() * 100), // return a random like count
            isLiked: !currentIsLiked
        }
    };
    return Promise.resolve(mockResponse);
  }
  const method = currentIsLiked ? 'DELETE' : 'POST'; // 현재 상태에 따라 HTTP 메소드 결정
  const response = await fetchWrapper(`/api/articles/${articleId}/like`, {
    method: method,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || '좋아요 상태 업데이트에 실패했습니다.');
  }

  return response.json();
}

/**
 * @function getPopularNews
 * @description '좋아요'가 많은 인기 기사 목록을 가져옵니다.
 * @param {string} [category] - 특정 카테고리의 인기 기사를 가져올 경우 카테고리 이름. 제공되지 않으면 전체 카테고리를 대상으로 합니다.
 * @param {string} [token] - 사용자 인증 토큰.
 * @returns {Promise<Article[]>} - 인기 기사 객체 배열.
 * @logic
 * - `category`가 지정되면 해당 카테고리의 인기 기사만 가져옵니다.
 * - `category`가 없으면 모든 주요 카테고리의 인기 기사를 각각 가져와 합친 후,
 *   중복을 제거하고 '좋아요' 수(`like_count`) 기준으로 내림차순 정렬하여 상위 20개를 반환합니다.
 */
export async function getPopularNews(category?: string, token?: string): Promise<Article[]> {
    if (USE_MOCKS) {
        let articles: Article[] = [];
        if (category) {
            articles = mockAllCategoryNews[category] || [];
        } else {
            articles = Object.values(mockAllCategoryNews).flat();
        }
        return Promise.resolve([...articles].sort((a,b) => (b.like_count || 0) - (a.like_count || 0)).slice(0, 20));
    }
  // 단일 카테고리에 대한 인기 기사를 가져오는 내부 함수
  const fetchByCategory = async (cat: string): Promise<Article[]> => {
    const url = `/api/articles/popular?category=${encodeURIComponent(cat)}`;
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    try {
      const response = await fetchWrapper(url, {
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

  // 특정 카테고리가 지정된 경우
  if (category) {
    return fetchByCategory(category);
  }

  // 전체 카테고리에 대한 인기 기사를 종합하는 경우
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

    // '좋아요'가 많은 순서대로 정렬
    uniqueArticles.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));

    return uniqueArticles.slice(0, 20); // 상위 20개 반환

  } catch (error) {
    if ((error as Error).message === 'Session expired') return [];
    console.error("전체 인기 뉴스 종합 실패:", error);
    return [];
  }
}

/**
 * @function toggleArticleSave
 * @description 사용자가 특정 기사를 저장하거나 저장을 취소합니다.
 * @param {string} token - 사용자 인증 토큰 (필수).
 * @param {number} articleId - 저장할 기사의 ID.
 * @param {boolean} currentIsSaved - 현재 저장 상태. true이면 저장 취소(DELETE), false이면 저장(POST)합니다.
 * @returns {Promise<any>} - 성공 시 API의 응답을 그대로 반환합니다. 204 No Content의 경우 성공 객체를 반환합니다.
 * @throws {Error} - API 호출 실패 시 에러를 발생시킵니다.
 */
export async function toggleArticleSave(token: string, articleId: number, currentIsSaved: boolean): Promise<ToggleSaveResponse> {
  if (USE_MOCKS) {
    console.log(`Mock toggling save for article ${articleId}. currentIsSaved: ${currentIsSaved}`);
    return Promise.resolve({ success: true });
  }
  const method = currentIsSaved ? 'DELETE' : 'POST';
  const response = await fetchWrapper(`/api/articles/${articleId}/save`, {
    method: method,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || '기사 저장 상태 업데이트에 실패했습니다.');
  }

  // DELETE 요청 성공 시 204 No Content를 반환하는 경우가 많으므로, 이를 처리합니다.
  if (response.status === 204) {
    return { success: true };
  }

    return response.json();

  }

  