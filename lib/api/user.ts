import { User, UserUpdate, Article } from "@/types";
import { BACKEND_BASE_URL } from "@/lib/constants";

/**
 * 토큰을 사용하여 현재 로그인된 사용자의 프로필 정보를 조회합니다.
 */
export async function getUserProfile(token: string): Promise<User> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/user/me`, {
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
 */
export async function updateUserProfile(token: string, updatedData: UserUpdate): Promise<User> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/user/me`, {
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

  return getUserProfile(token);
}

/**
 * 토큰을 사용하여 현재 로그인된 사용자가 좋아요한 기사 목록을 조회합니다.
 */
export async function getLikedArticles(token: string, limit: number = 20, offset: number = 0): Promise<Article[]> {
  const url = new URL(`${BACKEND_BASE_URL}/api/user/me/liked-articles`);
  url.searchParams.append('limit', String(limit));
  url.searchParams.append('offset', String(offset));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '좋아요한 기사를 가져오는데 실패했습니다.');
  }
  
  const data = await response.json();

  // API 응답을 Article[] 타입으로 변환
  return data.map((item: any) => ({
    ...item, // Use spread to keep existing fields like 'id', 'isLiked', 'favicon_url'
    isSaved: false, // Default to false, will be updated in the hook
  }));
}

/**
 * 선택 가능한 프로필 아바타 목록을 조회합니다.
 */
export async function getAvatars(): Promise<string[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/avatars`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 3600 }
  });

  if (!response.ok) {
    throw new Error('아바타 목록을 가져오는데 실패했습니다.');
  }

  return response.json();
}

export async function getNotificationSettings(token: string): Promise<NotificationSetting[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/user/me/notification-settings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
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
  const response = await fetch(`${BACKEND_BASE_URL}/api/user/me/notification-settings`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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
export async function getSavedArticles(token: string, limit: number = 20, offset: number = 0): Promise<Article[]> {
  const url = new URL(`${BACKEND_BASE_URL}/api/saved/articles`);
  url.searchParams.append('limit', String(limit));
  url.searchParams.append('offset', String(offset));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
    cache: 'no-store', // Always get the latest saved articles
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '저장된 기사를 가져오는데 실패했습니다.');
  }
  
  const data = await response.json();

  // API 응답을 Article[] 타입으로 변환
  return data.map((item: any) => ({
    id: item.article_id,
    saved_article_id: item.saved_article_id, // Add this ID for category management
    category_id: item.category_id, // <<< CRITICAL FIX
    source: item.source,
    source_domain: item.source_domain,
    title: item.title,
    url: item.url,
    published_at: item.published_at,
    thumbnail_url: item.thumbnail_url,
    favicon_url: `https://www.google.com/s2/favicons?domain=${item.source_domain}&sz=64`,
    isSaved: true,
    // The following properties are not in the saved articles response, so we set them to default values
    description: item.description || '',
    side: undefined,
    is_featured: 0,
    view_count: 0,
    like_count: 0,
    isLiked: false, // Assuming we don't know if the user liked it from this endpoint
  }));
}