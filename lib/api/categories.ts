'use client';

import { BACKEND_BASE_URL } from "@/lib/constants";
import { SavedArticleCategory } from "@/types";

/**
 * GET /api/saved/categories
 * 로그인한 사용자가 생성한 모든 카테고리 목록을 반환합니다.
 */
export async function getCategories(token: string): Promise<SavedArticleCategory[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/saved/categories`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('카테고리 목록을 불러오는데 실패했습니다.');
  }
  return response.json();
}

/**
 * POST /api/saved/categories
 * 새로운 카테고리를 생성합니다.
 */
export async function createCategory(token: string, name: string): Promise<SavedArticleCategory> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/saved/categories`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '카테고리 생성에 실패했습니다.');
  }
  return response.json();
}

/**
 * PUT /api/saved/categories/{categoryId}
 * 카테고리 이름을 변경합니다.
 */
export async function updateCategory(token: string, categoryId: number, name: string): Promise<SavedArticleCategory> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/saved/categories/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '카테고리 이름 변경에 실패했습니다.');
  }
  return response.json();
}

/**
 * DELETE /api/saved/categories/{categoryId}
 * 카테고리를 삭제합니다.
 */
export async function deleteCategory(token: string, categoryId: number): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/saved/categories/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '카테고리 삭제에 실패했습니다.');
  }
}

/**
 * PUT /api/saved/articles/{savedArticleId}
 * 저장된 기사의 카테고리를 변경합니다.
 */
export async function updateArticleCategory(token: string, savedArticleId: number, categoryId: number | null): Promise<void> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/saved/articles/${savedArticleId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ categoryId: categoryId }), // Corrected to camelCase 'categoryId' in JSON body
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || '기사 카테고리 변경에 실패했습니다.');
  }
}
