import { User, UserUpdate, Article, NotificationSetting } from "@/types";
import { fetchWrapper } from "./fetchWrapper";

/**
 * 토큰을 사용하여 현재 로그인된 사용자의 프로필 정보를 조회합니다.
 */
export async function getUserProfile(token: string): Promise<User> {
  const response = await fetchWrapper(`/api/user/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
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
 */
export async function updateUserProfile(token: string, updatedData: UserUpdate): Promise<User> {
  const response = await fetchWrapper(`/api/user/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '프로필 업데이트에 실패했습니다.');
  }

  return getUserProfile(token);
}

/**
 * 토큰을 사용하여 현재 로그인된 사용자가 좋아요한 기사 목록을 조회합니다.
 */
export async function getLikedArticles(token: string, limit: number = 20, offset: number = 0): Promise<{ articles: Article[], totalCount: number }> {
  const url = new URL(`/api/user/me/liked-articles`, 'http://localhost');
  url.searchParams.append('limit', String(limit));
  url.searchParams.append('offset', String(offset));

  const response = await fetchWrapper(url.pathname + url.search, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '좋아요한 기사를 가져오는데 실패했습니다.');
  }
  
  const data = await response.json();

  const articles = data.articles;

  if (!Array.isArray(articles)) {
    console.error("API response for liked articles is not an array or 'articles' property is missing:", articles);
    return { articles: [], totalCount: 0 };
  }

  const mappedArticles = articles.map((item: any) => ({
    ...item,
    isSaved: false,
  }));

  return { articles: mappedArticles, totalCount: data.totalCount || 0 };
}

/**
 * 선택 가능한 프로필 아바타 목록을 조회합니다.
 */
export async function getAvatars(): Promise<string[]> {
  const response = await fetchWrapper(`/api/avatars`, {
    method: 'GET',
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    throw new Error('아바타 목록을 가져오는데 실패했습니다.');
  }

  return response.json();
}

export async function getNotificationSettings(token: string): Promise<NotificationSetting[]> {
  const response = await fetchWrapper(`/api/user/me/notification-settings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '알림 설정을 가져오는데 실패했습니다.');
  }

  return response.json();
}

export async function updateNotificationSettings(token: string, settings: NotificationSetting[]): Promise<NotificationSetting[]> {
  const response = await fetchWrapper(`/api/user/me/notification-settings`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '알림 설정 업데이트에 실패했습니다.');
  }

  return response.json();
}

/**
 * 토큰을 사용하여 현재 로그인된 사용자가 저장한 기사 목록을 조회합니다.
 */
export async function getSavedArticles(token: string, limit: number = 20, offset: number = 0): Promise<{ articles: Article[], totalCount: number, byCategory: { category: string, count: number }[] }> {
  const url = new URL(`/api/saved/articles`, 'http://localhost');
  url.searchParams.append('limit', String(limit));
  url.searchParams.append('offset', String(offset));

  const response = await fetchWrapper(url.pathname + url.search, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '저장된 기사를 가져오는데 실패했습니다.');
  }
  
  const data = await response.json();

  const articles = data.articles;

  if (!Array.isArray(articles)) {
    console.error("API response for saved articles is not an array or 'articles' property is missing:", articles);
    return { articles: [], totalCount: 0, byCategory: [] };
  }

  const mappedArticles = articles.map((item: any) => ({
    id: item.article_id,
    saved_article_id: item.saved_article_id,
    category_id: item.category_id,
    source: item.source,
    source_domain: item.source_domain,
    title: item.title,
    url: item.url,
    published_at: item.published_at,
    thumbnail_url: item.thumbnail_url,
    favicon_url: `https://www.google.com/s2/favicons?domain=${item.source_domain}&sz=64`,
    isSaved: true,
    description: item.description || '',
    side: undefined,
    is_featured: 0,
    view_count: 0,
    like_count: 0,
    isLiked: false,
  }));

  return { articles: mappedArticles, totalCount: data.totalCount || 0, byCategory: data.byCategory || [] };
}

/**
 * 사용자의 비밀번호를 변경합니다.
 */
export async function changePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
  const response = await fetchWrapper(`/api/user/me/password`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    let errorMessage = errorData.message || '비밀번호 변경에 실패했습니다.';

    // Check for specific password mismatch messages from backend
    if (errorMessage.toLowerCase().includes('password') && 
        (errorMessage.toLowerCase().includes('incorrect') || errorMessage.toLowerCase().includes('mismatch'))) {
      errorMessage = '비밀번호가 일치하지 않습니다.';
    }

    throw new Error(errorMessage);
  }
}

/**
 * 사용자 계정을 삭제합니다.
 */
export async function deleteAccount(token: string, password: string): Promise<void> {
  const response = await fetchWrapper(`/api/user/me`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '계정 삭제에 실패했습니다.');
  }
}