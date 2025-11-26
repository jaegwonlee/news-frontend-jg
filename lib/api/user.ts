/**
 * @file user.ts
 * @description 로그인한 사용자와 관련된 모든 백엔드 API 호출을 정의합니다.
 * 사용자의 프로필 정보, '좋아요' 및 '저장'한 기사 목록, 알림 설정, 비밀번호 변경, 계정 삭제 등
 * 사용자 계정 관리에 필요한 함수들을 포함합니다.
 */

import { User, UserUpdate, Article, NotificationSetting } from "@/types";
import { fetchWrapper } from "./fetchWrapper";
import { mockUserProfile, mockLikedArticles, mockSavedArticles, mockAvatars, mockNotificationSettings, mockSavedArticleCategories } from "@/app/mocks/user";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'; // Set to true to use mock data

/**
 * @function getUserProfile
 * @description 인증 토큰을 사용하여 현재 로그인된 사용자의 프로필 정보를 조회합니다.
 * @param {string} token - 사용자 인증을 위한 Bearer 토큰.
 * @returns {Promise<User>} - 사용자의 프로필 정보를 담은 User 객체를 반환하는 프로미스.
 * @throws {Error} - API 호출 실패 시 에러를 발생시킵니다.
 * @cache 5분(300초) 주기로 ISR을 통해 캐시를 갱신합니다.
 */
export async function getUserProfile(token: string): Promise<User> {
  if (USE_MOCKS) {
    console.log("Mock: Fetching user profile");
    return Promise.resolve(mockUserProfile);
  }
  const response = await fetchWrapper(`/api/user/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    next: { revalidate: 300 } 
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '프로필 정보를 가져오는데 실패했습니다.' }));
    throw new Error(errorData.message || '프로필 정보를 가져오는데 실패했습니다.');
  }

  const data = await response.json();

  // 백엔드에서 받은 데이터를 프론트엔드 타입(User)에 맞게 매핑합니다.
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
 * @function updateUserProfile
 * @description 사용자의 프로필 정보(닉네임, 소개, 프로필 이미지 URL 등)를 업데이트합니다.
 * @param {string} token - 사용자 인증 토큰.
 * @param {UserUpdate} updatedData - 업데이트할 사용자 정보가 담긴 객체.
 * @returns {Promise<User>} - 업데이트된 최신 사용자 프로필 정보를 반환하는 프로미스.
 * @throws {Error} - 프로필 업데이트 실패 시 에러를 발생시킵니다.
 * @logic 프로필 업데이트 성공 후, `getUserProfile`을 다시 호출하여 최신 데이터를 가져와 반환합니다.
 */
export async function updateUserProfile(token: string, updatedData: UserUpdate): Promise<User> {
  if (USE_MOCKS) {
    console.log("Mock: Updating user profile", updatedData);
    // Simulate update by merging with mockUserProfile
    const updatedUser = { ...mockUserProfile, ...updatedData };
    return Promise.resolve(updatedUser);
  }
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

  // 업데이트 성공 후 최신 프로필 정보를 다시 조회하여 반환
  return getUserProfile(token);
}

/**
 * @function getLikedArticles
 * @description 현재 로그인된 사용자가 '좋아요'한 기사 목록을 페이지네이션과 함께 조회합니다.
 * @param {string} token - 사용자 인증 토큰.
 * @param {number} [limit=20] - 한 번에 가져올 기사 수.
 * @param {number} [offset=0] - 가져올 기사의 시작 위치.
 * @returns {Promise<{ articles: Article[], totalCount: number }>} - '좋아요'한 기사 목록과 전체 개수를 포함하는 객체.
 * @throws {Error} - API 호출 실패 시 에러를 발생시킵니다.
 * @cache 1분(60초) 주기로 ISR을 통해 캐시를 갱신합니다.
 */
export async function getLikedArticles(token: string, limit: number = 20, offset: number = 0): Promise<{ articles: Article[], totalCount: number }> {
  if (USE_MOCKS) {
    console.log("Mock: Fetching liked articles");
    const paginatedArticles = mockLikedArticles.slice(offset, offset + limit);
    return Promise.resolve({ articles: paginatedArticles, totalCount: mockLikedArticles.length });
  }
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

  // API 응답 형식이 예상과 다를 경우를 대비한 방어 코드
  if (!Array.isArray(articles)) {
    console.error("API response for liked articles is not an array or 'articles' property is missing:", articles);
    return { articles: [], totalCount: 0 };
  }

  // API 응답 데이터를 프론트엔드 Article 타입에 맞게 매핑
  const mappedArticles = articles.map((item: any) => ({
    ...item,
    isSaved: false, // '좋아요' 목록에서는 '저장' 상태를 알 수 없으므로 기본값 false로 설정
  }));

  return { articles: mappedArticles, totalCount: data.totalCount || 0 };
}

/**
 * @function getAvatars
 * @description 사용자가 프로필 이미지로 선택할 수 있는 아바타 이미지 URL 목록을 조회합니다.
 * @returns {Promise<string[]>} - 아바타 이미지 URL 문자열의 배열.
 * @throws {Error} - API 호출 실패 시 에러를 발생시킵니다.
 * @cache 1시간(3600초) 주기로 ISR을 통해 캐시를 갱신합니다. 아바타 목록은 자주 바뀌지 않으므로 캐시 기간을 길게 설정합니다.
 */
export async function getAvatars(token: string): Promise<string[]> {
  if (USE_MOCKS) {
    console.log("Mock: Fetching avatars");
    return Promise.resolve(mockAvatars);
  }
  try {
    const response = await fetchWrapper(`/api/avatars`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      // Log the error instead of throwing, to prevent crashing the profile page
      console.error('아바타 목록을 가져오는데 실패했습니다. Status:', response.status);
      return []; // Return empty array on failure
    }

    return response.json();
  } catch (error) {
    console.error('An unexpected error occurred in getAvatars:', error);
    return []; // Return empty array on unexpected errors too
  }
}

/**
 * @function getNotificationSettings
 * @description 현재 사용자의 알림 설정을 조회합니다.
 * @param {string} token - 사용자 인증 토큰.
 * @returns {Promise<NotificationSetting[]>} - 사용자의 알림 설정 객체 배열.
 * @throws {Error} - API 호출 실패 시 에러를 발생시킵니다.
 * @cache 'no-store' 옵션으로 캐시를 사용하지 않아 항상 최신 설정을 가져옵니다.
 */
export async function getNotificationSettings(token: string): Promise<NotificationSetting[]> {
  if (USE_MOCKS) {
    console.log("Mock: Fetching notification settings");
    return Promise.resolve(mockNotificationSettings);
  }
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

/**
 * @function updateNotificationSettings
 * @description 사용자의 알림 설정을 업데이트합니다.
 * @param {string} token - 사용자 인증 토큰.
 * @param {NotificationSetting[]} settings - 업데이트할 알림 설정 객체 배열.
 * @returns {Promise<NotificationSetting[]>} - 업데이트된 알림 설정 객체 배열.
 * @throws {Error} - API 호출 실패 시 에러를 발생시킵니다.
 */
export async function updateNotificationSettings(token: string, settings: NotificationSetting[]): Promise<NotificationSetting[]> {
  if (USE_MOCKS) {
    console.log("Mock: Updating notification settings", settings);
    return Promise.resolve(settings); // Simulate successful update
  }
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
 * @function getSavedArticles
 * @description 현재 로그인된 사용자가 '저장'한 기사 목록을 페이지네이션 및 통계와 함께 조회합니다.
 * @param {string} token - 사용자 인증 토큰.
 * @param {number} [limit=20] - 한 번에 가져올 기사 수.
 * @param {number} [offset=0] - 가져올 기사의 시작 위치.
 * @returns {Promise<{ articles: Article[], totalCount: number, byCategory: { category: string, count: number }[] }>}
 *          - 저장된 기사 목록, 전체 개수, 카테고리별 개수 통계를 포함하는 객체.
 * @throws {Error} - API 호출 실패 시 에러를 발생시킵니다.
 * @cache 'no-store' 옵션으로 캐시를 사용하지 않아 항상 최신 데이터를 가져옵니다.
 */
export async function getSavedArticles(token: string, limit: number = 20, offset: number = 0): Promise<{ articles: Article[], totalCount: number, byCategory: { category: string, count: number }[] }> {
  if (USE_MOCKS) {
    console.log("Mock: Fetching saved articles");
    const paginatedArticles = mockSavedArticles.slice(offset, offset + limit);
    return Promise.resolve({ 
      articles: paginatedArticles, 
      totalCount: mockSavedArticles.length, 
      byCategory: mockSavedArticleCategories.map(cat => ({ 
        category: cat.name, 
        count: cat.article_count || 0 
      })) 
    });
  }
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

  // 백엔드에서 받은 '저장된 기사' 데이터를 프론트엔드 'Article' 타입에 맞게 변환합니다.
  // 필드 이름이 다르거나 없는 필드를 채워넣는 역할을 합니다.
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
    favicon_url: `https://www.google.com/s2/favicons?domain=${item.source_domain}&sz=64`, // 파비콘 URL 동적 생성
    isSaved: true, // 이 함수로 가져온 기사는 항상 '저장된' 상태입니다.
    description: item.description || '',
    // '저장된 기사' 목록 API는 아래 필드들을 제공하지 않으므로 기본값을 설정합니다.
    side: undefined,
    is_featured: 0,
    view_count: 0,
    like_count: 0,
    isLiked: false,
  }));

  return { articles: mappedArticles, totalCount: data.totalCount || 0, byCategory: data.byCategory || [] };
}

/**
 * @function changePassword
 * @description 사용자의 현재 비밀번호를 확인하고 새 비밀번호로 변경합니다.
 * @param {string} token - 사용자 인증 토큰.
 * @param {string} currentPassword - 현재 사용 중인 비밀번호.
 * @param {string} newPassword - 새로 설정할 비밀번호.
 * @returns {Promise<void>} - 성공 시 아무것도 반환하지 않습니다.
 * @throws {Error} - 현재 비밀번호가 틀렸거나 API 호출에 실패했을 경우 에러를 발생시킵니다.
 */
export async function changePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
  if (USE_MOCKS) {
    console.log("Mock: Changing password");
    if (currentPassword === "aaaa1111!!!!") { // Check against the mock login password
      return Promise.resolve();
    } else {
      return Promise.reject(new Error("현재 비밀번호가 일치하지 않습니다. (목업)"));
    }
  }
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

    // 백엔드 에러 메시지에 'password', 'incorrect', 'mismatch' 등의 키워드가 포함되면
    // 더 사용자 친화적인 메시지로 변경합니다.
    if (errorMessage.toLowerCase().includes('password') && 
        (errorMessage.toLowerCase().includes('incorrect') || errorMessage.toLowerCase().includes('mismatch'))) {
      errorMessage = '비밀번호가 일치하지 않습니다.';
    }

    throw new Error(errorMessage);
  }
}

/**
 * @function deleteAccount
 * @description 현재 비밀번호를 확인한 후 사용자 계정을 삭제합니다.
 * @param {string} token - 사용자 인증 토큰.
 * @param {string} currentPassword - 계정 삭제를 확인하기 위한 현재 비밀번호.
 * @returns {Promise<void>} - 성공 시 아무것도 반환하지 않습니다.
 * @throws {Error} - 비밀번호가 틀렸거나 API 호출에 실패했을 경우 에러를 발생시킵니다.
 * @special `skipAuthCheckFor401: true`를 사용하여, 비밀번호 불일치로 401 에러가 발생해도
 *          자동 로그아웃 처리(세션 만료 이벤트)가 발생하지 않도록 합니다.
 */
export async function deleteAccount(token: string, currentPassword: string): Promise<void> {
  if (USE_MOCKS) {
    console.log("Mock: Deleting account");
    if (currentPassword === "aaaa1111!!!!") { // Check against the mock login password
      return Promise.resolve();
    } else {
      return Promise.reject(new Error("비밀번호가 일치하지 않습니다. (목업)"));
    }
  }
  const response = await fetchWrapper(`/api/user/me/delete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword }),
    skipAuthCheckFor401: true,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '계정 삭제에 실패했습니다.');
  }
}
