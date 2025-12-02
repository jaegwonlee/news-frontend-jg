/**
 * @file notifications.ts
 * @description 알림 관련 API 호출을 담당하는 서비스 파일입니다.
 * 알림 목록 조회, 읽음 처리, 설정 조회 및 수정 등의 기능을 제공합니다.
 */

import { fetchWrapper } from "./fetchWrapper";

// 알림 타입 정의
export type NotificationType = "NEW_TOPIC" | "BREAKING_NEWS" | "EXCLUSIVE_NEWS" | "VOTE_REMINDER" | "ADMIN_NOTICE";

export interface NotificationItem {
  id: number;
  type: NotificationType;
  message: string;
  url: string;
  is_read: boolean;
  created_at: string;
  metadata?: {
    source?: string;
    source_domain?: string;
    thumbnail_url?: string;
    published_at?: string;
    [key: string]: any;
  };
}

/**
 * @function getNotifications
 * @description 사용자의 알림 목록을 조회합니다.
 * @param {string} token - 사용자 인증 토큰
 * @returns {Promise<NotificationItem[]>} 알림 목록
 */
export async function getNotifications(token: string): Promise<NotificationItem[]> {
  const response = await fetchWrapper("/api/notifications", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("알림 목록을 불러오는데 실패했습니다.");
  }

  return response.json();
}

/**
 * @function getUnreadCount
 * @description 읽지 않은 알림 개수를 조회합니다.
 * @param {string} token - 사용자 인증 토큰
 * @returns {Promise<number>} 읽지 않은 알림 개수
 */
export async function getUnreadCount(token: string): Promise<number> {
  const response = await fetchWrapper("/api/notifications/unread-count", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    // 에러 발생 시 0으로 처리하거나 에러를 던질 수 있음. 여기선 0 반환 안전장치.
    console.error("읽지 않은 알림 개수 조회 실패");
    return 0;
  }

  const data = await response.json();
  return data.count || 0; // 백엔드 응답 구조에 따라 조정 필요 (가이드엔 단순 number인지 객체인지 명시 없으나 보통 { count: 5 } 형태)
  // 가이드: GET /api/notifications/unread-count
  // 응답 예시가 없지만 보통 { count: 5 } 또는 5.
  // 만약 number 자체라면 data가 숫자일 것임. 안전하게 처리.
}

/**
 * @function markAsRead
 * @description 특정 알림을 읽음 처리합니다.
 * @param {string} token - 사용자 인증 토큰
 * @param {number} id - 알림 ID
 */
export async function markAsRead(token: string, id: number): Promise<void> {
  const response = await fetchWrapper(`/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("알림 읽음 처리에 실패했습니다.");
  }
}

/**
 * @function markAllAsRead
 * @description 모든 알림을 읽음 처리합니다.
 * @param {string} token - 사용자 인증 토큰
 */
export async function markAllAsRead(token: string): Promise<void> {
  const response = await fetchWrapper(`/api/notifications/read-all`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("전체 읽음 처리에 실패했습니다.");
  }
}
