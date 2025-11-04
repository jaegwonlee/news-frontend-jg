'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Article } from '@/types';
import { getSavedArticles } from '@/lib/api/user';
import { getCategories, createCategory, deleteCategory, updateCategory, updateArticleCategory } from '@/lib/api/categories';
import { SavedArticleCategory } from '@/types';
import { useRouter } from "next/navigation"; // 👈 useRouter 임포트

export const useSavedArticlesManager = () => {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<SavedArticleCategory[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [savedArticlesResponse, fetchedCategories] = await Promise.all([
        getSavedArticles(token),
        getCategories(token),
      ]);
      
      setArticles(savedArticlesResponse.articles);
      setTotalCount(savedArticlesResponse.totalCount);
      setCategories(fetchedCategories);

      // Process byCategory into a lookup map
      const counts = savedArticlesResponse.byCategory.reduce((acc, item) => {
        acc[item.category] = item.count;
        return acc;
      }, {} as Record<string, number>);
      setCategoryCounts(counts);

    } catch (err: any) {
      if ((err as Error).message !== 'Session expired') {
        setError(err.message || "데이터를 불러오는 데 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, logout, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCategory = useCallback(async (name: string) => {
    if (!token) return undefined;
    try {
      const newCategory = await createCategory(token, name);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error: any) {
      console.error("Failed to create category:", error);
      if ((error as Error).message !== 'Session expired') {
        // Handle other errors if needed
      }
      return undefined;
    }
  }, [token, logout, router]);

  const handleDeleteCategory = useCallback(async (categoryId: number) => {
    if (!token) return;
    try {
      await deleteCategory(token, categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setArticles(prev => prev.map(a => a.category_id === categoryId ? { ...a, category_id: null } : a));
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
      }
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      if ((error as Error).message !== 'Session expired') {
        // Handle other errors if needed
      }
    }
  }, [token, selectedCategoryId, logout, router]);

  const handleRenameCategory = useCallback(async (categoryId: number, newName: string) => {
    if (!token) return;
    try {
      const updated = await updateCategory(token, categoryId, newName);
      setCategories(prev => prev.map(c => c.id === categoryId ? updated : c));
    } catch (error: any) {
      console.error("Failed to rename category:", error);
      if ((error as Error).message !== 'Session expired') {
        // Handle other errors if needed
      }
    }
  }, [token, logout, router]);

  const handleUpdateArticleCategory = useCallback(async (savedArticleId: number, categoryId: number | null) => {
    if (!token) return;
    try {
      await updateArticleCategory(token, savedArticleId, categoryId);
      setArticles(prev => prev.map(a => 
        a.saved_article_id === savedArticleId 
          ? { ...a, category_id: categoryId } 
          : a
      ));
    } catch (error: any) {
      console.error("Failed to update article category:", error);
      if ((error as Error).message !== 'Session expired') {
        // Handle other errors if needed
      }
    }
  }, [token, logout, router]);

  const handleUnsaveArticle = useCallback(async (articleId: number) => {
    // This should be implemented with a real API call
    setArticles(prev => prev.filter(a => a.saved_article_id !== articleId));
  }, []);

  const filteredArticles = useMemo(() => {
    if (selectedCategoryId === null) {
      return articles;
    }
    return articles.filter(a => a.category_id === selectedCategoryId);
  }, [articles, selectedCategoryId]);

  return {
    articles,
    totalCount,
    categories,
    categoryCounts, // Add this
    filteredArticles,
    isLoading,
    error,
    selectedCategoryId,
    setSelectedCategoryId,
    handleCreateCategory,
    handleDeleteCategory,
    handleRenameCategory,
    handleUpdateArticleCategory,
    handleUnsaveArticle,
    fetchData, // Return fetchData to allow manual refetching
  };
};
