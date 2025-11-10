'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Article } from '@/types';
import { getSavedArticles } from '@/lib/api/user';
import { toggleArticleSave } from '@/lib/api/articles'; // Import toggleArticleSave
import { getCategories, createCategory, deleteCategory, updateCategory, updateArticleCategory } from '@/lib/api/categories';
import { SavedArticleCategory } from '@/types';
import { useRouter } from "next/navigation";

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

      const counts = fetchedCategories.reduce((acc, category) => {
        acc[category.id] = category.article_count ?? 0;
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
      setCategories(prev => [...prev, { ...newCategory, article_count: 0 }]);
      return newCategory;
    } catch (error: any) {
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
    } catch (error: any) {
      console.error("Failed to delete category:", error);
    }
  }, [token, selectedCategoryId]);

  const handleRenameCategory = useCallback(async (categoryId: number, newName: string) => {
    if (!token) return;
    try {
      const updated = await updateCategory(token, categoryId, newName);
      setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, name: updated.name } : c));
    } catch (error: any) {
      console.error("Failed to rename category:", error);
    }
  }, [token]);

  const handleUpdateArticleCategory = useCallback(async (articleToUpdate: Article, newCategoryId: number | null) => {
    if (!token || articleToUpdate.saved_article_id === undefined) return;
    const oldCategoryId = articleToUpdate.category_id;

    try {
      await updateArticleCategory(token, articleToUpdate.saved_article_id, newCategoryId);
      
      setArticles(prev => prev.map(a => 
        a.saved_article_id === articleToUpdate.saved_article_id 
          ? { ...a, category_id: newCategoryId } 
          : a
      ));

      setCategories(prev => prev.map(c => {
        if (c.id === oldCategoryId) {
          return { ...c, article_count: (c.article_count ?? 0) - 1 };
        }
        if (c.id === newCategoryId) {
          return { ...c, article_count: (c.article_count ?? 0) + 1 };
        }
        return c;
      }));

    } catch (error: any) {
      console.error("Failed to update article category:", error);
    }
  }, [token]);

  const handleUnsaveArticle = useCallback(async (articleToUnsave: Article) => {
    if (!token) return;

    const { id: articleId, category_id: categoryId } = articleToUnsave;

    try {
      await toggleArticleSave(token, articleId, true); // true because we are unsaving

      setArticles(prev => prev.filter(a => a.id !== articleId));
      setTotalCount(prev => prev - 1);

      if (categoryId) {
        setCategories(prev => prev.map(c => 
          c.id === categoryId 
            ? { ...c, article_count: (c.article_count ?? 0) > 0 ? (c.article_count ?? 0) - 1 : 0 } 
            : c
        ));
      }

    } catch (error) {
      console.error("Failed to unsave article:", error);
    }
  }, [token]);

  const filteredArticles = useMemo(() => {
    if (selectedCategoryId === null) {
      return articles.filter(a => a.category_id === null);
    }
    return articles.filter(a => a.category_id === selectedCategoryId);
  }, [articles, selectedCategoryId]);

  const unclassifiedCount = useMemo(() => {
    return articles.filter(a => a.category_id === null).length;
  }, [articles]);

  return {
    articles,
    totalCount,
    categories,
    categoryCounts, // This seems unused, categories now has the count
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
    fetchData,
    unclassifiedCount,
  };
};