'use client';

import { fetchWrapper } from "./fetchWrapper";
import { SavedArticleCategory } from "@/types";
import { mockSavedArticleCategories } from "@/app/mocks/user";
import { mockSavedArticles } from "@/app/mocks/articles";

const USE_MOCKS = true; // Set to true to use mock data

/**
 * GET /api/saved/categories
 * 로그인한 사용자가 생성한 모든 카테고리 목록을 반환합니다.
 */
export async function getCategories(token: string): Promise<SavedArticleCategory[]> {
  if (USE_MOCKS) {
    console.log("Mock: Fetching categories");
    return Promise.resolve(mockSavedArticleCategories);
  }
  const response = await fetchWrapper(`/api/saved/categories`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
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
  if (USE_MOCKS) {
    console.log(`Mock: Creating category "${name}"`);
    const newId = Math.max(...mockSavedArticleCategories.map(c => c.id), 0) + 1;
    const newCategory = { id: newId, name, created_at: new Date().toISOString(), article_count: 0 };
    mockSavedArticleCategories.push(newCategory); // Simulate adding
    return Promise.resolve(newCategory);
  }
  const response = await fetchWrapper(`/api/saved/categories`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
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
  if (USE_MOCKS) {
    console.log(`Mock: Updating category ${categoryId} to "${name}"`);
    const categoryToUpdate = mockSavedArticleCategories.find(c => c.id === categoryId);
    if (categoryToUpdate) {
        categoryToUpdate.name = name; // Simulate update
        return Promise.resolve(categoryToUpdate);
    }
    return Promise.reject(new Error("Mock: Category not found"));
  }
  const response = await fetchWrapper(`/api/saved/categories/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
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
  if (USE_MOCKS) {
    console.log(`Mock: Deleting category ${categoryId}`);
    const index = mockSavedArticleCategories.findIndex(c => c.id === categoryId);
    if (index > -1) {
        mockSavedArticleCategories.splice(index, 1); // Simulate deletion
    }
    return Promise.resolve();
  }
  const response = await fetchWrapper(`/api/saved/categories/${categoryId}`, {
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
  if (USE_MOCKS) {
    console.log(`Mock: Updating category for saved article ${savedArticleId} to ${categoryId}`);
    // Simulate finding and updating the article in mockSavedArticles
    const articleToUpdate = mockSavedArticles.find(a => a.saved_article_id === savedArticleId);
    if (articleToUpdate) {
        articleToUpdate.category_id = categoryId;
    }
    return Promise.resolve();
  }
  const response = await fetchWrapper(`/api/saved/articles/${savedArticleId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ categoryId: categoryId }), // Corrected to camelCase 'categoryId' in JSON body
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || '기사 카테고리 변경에 실패했습니다.');
  }
}
