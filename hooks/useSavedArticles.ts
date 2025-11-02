'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Article } from '@/types';
import { getSavedArticles } from '@/lib/api/user';
import { getCategories, createCategory, deleteCategory, updateCategory, updateArticleCategory } from '@/lib/api/categories';
import { SavedArticleCategory } from '@/types';

export const useSavedArticlesManager = () => {
  const { token } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<SavedArticleCategory[]>([]);
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
      const [fetchedArticles, fetchedCategories] = await Promise.all([
        getSavedArticles(token),
        getCategories(token),
      ]);
      setArticles(fetchedArticles);
      setCategories(fetchedCategories);
    } catch (err: any) {
      setError(err.message || "데이터를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateCategory = useCallback(async (name: string) => {
    if (!token) return undefined;
    try {
      const newCategory = await createCategory(token, name);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error("Failed to create category:", error);
      return undefined;
    }
  }, [token]);

  const handleDeleteCategory = useCallback(async (categoryId: number) => {
    if (!token) return;
    try {
      await deleteCategory(token, categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setArticles(prev => prev.map(a => a.category_id === categoryId ? { ...a, category_id: null } : a));
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  }, [token, selectedCategoryId]);

  const handleRenameCategory = useCallback(async (categoryId: number, newName: string) => {
    if (!token) return;
    const updated = await updateCategory(token, categoryId, newName);
    setCategories(prev => prev.map(c => c.id === categoryId ? updated : c));
  }, [token]);

  const handleUpdateArticleCategory = useCallback(async (savedArticleId: number, categoryId: number | null) => {
    if (!token) return;
    await updateArticleCategory(token, savedArticleId, categoryId);
    setArticles(prev => prev.map(a => 
      a.saved_article_id === savedArticleId 
        ? { ...a, category_id: categoryId } 
        : a
    ));
  }, [token]);

  const handleUnsaveArticle = useCallback(async (articleId: number) => {
    // This should be implemented with a real API call
    setArticles(prev => prev.filter(a => a.saved_article_id !== articleId));
  }, []);

  const filteredArticles = useMemo(() => {
    if (selectedCategoryId === null) {
      return articles.filter(a => !a.category_id);
    }
    return articles.filter(a => a.category_id === selectedCategoryId);
  }, [articles, selectedCategoryId]);

  return {
    articles,
    categories,
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
