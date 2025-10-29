import { Topic, TopicDetail, Article, User, UserUpdate } from "@/types";
import { BACKEND_BASE_URL } from "@/lib/constants"; // Import BACKEND_BASE_URL

export async function signUpUser(userData: any) {
  const response = await fetch('https://news02.onrender.com/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    // 서버가 보낸 에러 메시지가 있다면 사용하고, 없다면 기본 메시지를 사용합니다.
    throw new Error(data.message || '회원가입에 실패했습니다.');
  }

  return data;
}

export async function loginUser(credentials: any) {
  const response = await fetch('https://news02.onrender.com/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    // 서버가 보낸 에러 메시지가 있다면 사용하고, 없다면 기본 메시지를 사용합니다.
    // 401 에러의 경우, data.message가 없을 수 있으므로 별도 처리
    if (response.status === 401) {
      throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
    throw new Error(data.message || '로그인에 실패했습니다.');
  }

  return data;
}

export async function getTopics(): Promise<Topic[]> {
  // Revalidate every minute
  const response = await fetch('https://news02.onrender.com/api/topics', { next: { revalidate: 60 } });
  if (!response.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch topics');
  }
  return response.json();
}

export async function getTopicDetail(topicId: string): Promise<TopicDetail> {
  const url = `https://news02.onrender.com/api/topics/${topicId}`;
  const response = await fetch(url, { next: { revalidate: 60 } });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`API Error fetching topic detail: ${response.status} ${response.statusText}`);
    console.error(`URL: ${url}`);
    console.error(`Response Body: ${errorBody}`);
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch topic details. Status: ${response.status}`);
  }
  return response.json();
}

export async function incrementTopicView(topicId: string): Promise<void> {
  try {
    const response = await fetch(`https://news02.onrender.com/api/topics/${topicId}/view`, {
      method: 'POST',
    });
    if (!response.ok) {
      // Don't throw an error here, as it's not critical for page rendering.
      // Just log it for debugging.
      console.error(`Failed to increment topic view count. Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error in incrementTopicView:', error);
  }
}

export async function getPopularTopics(): Promise<Topic[]> {
  const response = await fetch('https://news02.onrender.com/api/topics/popular-ranking', { next: { revalidate: 60 } });
  if (!response.ok) {
    // By not throwing an error, we prevent the whole page from crashing if only this component fails.
    console.error('Failed to fetch popular topics');
    return []; // Return an empty array as a fallback.
  }
  return response.json();
}


/**
 * [속보] 기사 목록을 가져옵니다 (10개)
 */
export async function getBreakingNews(): Promise<Article[]> {
  try {
    const res = await fetch(`https://news02.onrender.com/api/articles/breaking?limit=10&offset=0`, {
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
    const res = await fetch(`https://news02.onrender.com/api/articles/exclusives?limit=10&offset=0`, { 
      next: { revalidate: 300 } // 5분마다 캐시 갱신
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch exclusive news:", error);
    return [];
  }
}

// lib/api.ts (파일 맨 아래에 아래 두 함수를 추가)

// Article 타입 import 확인 (파일 상단에 있어야 함)
// 예: import { Topic, TopicDetail, Article } from " @/types"; 

/**
 * 특정 카테고리의 뉴스 목록을 가져옵니다.
 * (getLatestNews 함수가 사용합니다)
 */
export async function getCategoryNews(categoryName: string, limit: number = 10): Promise<Article[]> {
  const encodedCategoryName = encodeURIComponent(categoryName);
  const apiUrl = `https://news02.onrender.com/api/articles/by-category?name=${encodedCategoryName}&limit=${limit}&offset=0`;
  try {
    // CategoryNewsList와 동일하게 no-store 사용 (빌드 로그 관련)
    const response = await fetch(apiUrl, { cache: "no-store" }); 
    if (!response.ok) {
      throw new Error(`API 호출 실패 (${categoryName}): ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`${categoryName} 뉴스 로드 실패:`, error);
    return []; // 에러 시 빈 배열 반환
  }
}


/**
 * 여러 카테고리의 최신 뉴스를 종합하여 시간순으로 정렬 후 반환합니다.
 * (LatestNews 컴포넌트에서 사용)
 * @param limit 반환할 최대 기사 수 (기본값: 10)
 */
export async function getLatestNews(limit: number = 10): Promise<Article[]> {
  try {
    const categories = ["정치", "경제", "사회", "문화"];
    // 각 카테고리별로 기사를 가져오는 Promise들을 생성 (limit은 넉넉하게 가져옴)
    const promises = categories.map((category) => getCategoryNews(category, limit)); 
    const results = await Promise.all(promises);

    // 모든 결과를 하나의 배열로 합칩니다.
    const allArticles = results.flat();
    
    // Set을 사용하여 중복 기사를 ID 기준으로 제거합니다.
    const uniqueArticlesMap = new Map<number, Article>();
    allArticles.forEach((article) => {
      uniqueArticlesMap.set(article.id, article);
    });
    
    // Map을 다시 배열로 변환하고 발행 시간(published_at) 기준 내림차순(최신순)으로 정렬합니다.
    const uniqueArticles = Array.from(uniqueArticlesMap.values());
    uniqueArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    // 요청된 limit만큼 기사를 잘라서 반환합니다.
    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error("최신 뉴스 종합 실패:", error);
    return []; // 에러 시 빈 배열 반환
  }
}

/**
 * 토큰을 사용하여 현재 로그인된 사용자의 프로필 정보를 조회합니다.
 * @param token - 사용자 인증 토큰
 * @returns 사용자 프로필 정보 (User 타입)
 */
export async function getUserProfile(token: string): Promise<User> {
  const response = await fetch('https://news02.onrender.com/api/user/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
    next: { revalidate: 300 } 
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '프로필 정보를 가져오는데 실패했습니다.');
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    nickname: data.nickname,
    phone: data.phone,
    profile_image_url: data.profile_image_url,
    introduction: data.introduction,
  };
}

/**
 * 사용자 프로필 정보(닉네임, 소개, 프로필 이미지 URL)를 업데이트합니다.
 * @param token - 사용자 인증 토큰
 * @param updatedData - 업데이트할 사용자 정보 (UserUpdate 타입)
 * @returns 업데이트된 사용자 프로필 정보 (User 타입)
 */
export async function updateUserProfile(token: string, updatedData: UserUpdate): Promise<User> {
  const response = await fetch('https://news02.onrender.com/api/user/me', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '프로필 업데이트에 실패했습니다.');
  }

  // After a successful update, fetch the complete user profile to ensure all fields are up-to-date.
  // This is necessary if the PUT /api/profile endpoint does not return the full User object.
  return getUserProfile(token);
}

/**
 * 선택 가능한 프로필 아바타 목록을 조회합니다.
 * @returns 아바타 이미지 URL 배열 (string[])
 */
export async function getAvatars(): Promise<string[]> {
  const response = await fetch('https://news02.onrender.com/api/avatars', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 3600 } // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error('아바타 목록을 가져오는데 실패했습니다.');
  }

  return response.json();
}

/**
 * 검색어(q)를 받아 제목과 설명에서 일치하는 기사를 최신순으로 검색합니다.
 * @param q - 검색할 키워드
 * @returns 검색 결과 기사 목록 (Article[])
 */
export async function getSearchArticles(q: string): Promise<Article[]> {
  const encodedQuery = encodeURIComponent(q);
  const response = await fetch(`${BACKEND_BASE_URL}/api/search?q=${encodedQuery}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 60 } // Revalidate every minute
  });

  if (!response.ok) {
    throw new Error('검색 결과를 가져오는데 실패했습니다.');
  }

  return response.json();
}
