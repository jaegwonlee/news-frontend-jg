"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import ArticleCard from "@/app/components/ArticleCard";
import ChatRoom from "@/app/components/ChatRoom";
import TopicViewCounter from "@/app/components/TopicViewCounter";
import { getTopicDetail, toggleArticleLike, toggleArticleSave } from "@/lib/api";
import { getComments } from "@/lib/api/comments";
import { TopicDetail, Article, Comment, CommentReactionUpdate } from "@/types";
import { useAuth } from "@/app/context/AuthContext";
import RelatedTopicsCarousel from "@/app/components/RelatedTopicsCarousel";
import CommentSidePanel from "@/app/components/CommentSidePanel";

export default function TopicDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { token } = useAuth();

  const [topicDetail, setTopicDetail] = useState<TopicDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [leftPanelArticle, setLeftPanelArticle] = useState<Article | null>(null);
  const [rightPanelArticle, setRightPanelArticle] = useState<Article | null>(null);

  const [commentsByArticle, setCommentsByArticle] = useState<Record<number, Comment[]>>({});
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

  useEffect(() => {
    if (id && !isNaN(parseInt(id, 10))) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const data = await getTopicDetail(id, token || undefined);
          
          if (data.articles && data.articles.length > 0) {
            const commentCountPromises = data.articles.map(async (article) => {
              try {
                const { totalCount } = await getComments(article.id, token || undefined);
                return { ...article, comment_count: totalCount };
              } catch (commentError) {
                console.error(`Failed to fetch comment count for article ${article.id}:`, commentError);
                return { ...article, comment_count: 0 };
              }
            });
            const articlesWithCommentCounts = await Promise.all(commentCountPromises);
            setTopicDetail({ ...data, articles: articlesWithCommentCounts });
          } else {
            setTopicDetail(data);
          }
        } catch (err) {
          setError("토픽 정보를 불러오는 데 실패했습니다.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [id, token]);

  const handleLikeToggle = async (articleToToggle: Article) => {
    if (!token) return;
    try {
      const response = await toggleArticleLike(token, articleToToggle.id, articleToToggle.isLiked || false);
      setTopicDetail((prevDetail) => {
        if (!prevDetail) return null;
        return {
          ...prevDetail,
          articles: prevDetail.articles.map((article) =>
            article.id === articleToToggle.id
              ? { ...article, isLiked: response.data.isLiked, like_count: response.data.likes }
              : article
          ),
        };
      });
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleSaveToggle = async (articleToToggle: Article) => {
    if (!token) return;
    const newIsSaved = !articleToToggle.isSaved;
    try {
      await toggleArticleSave(token, articleToToggle.id, articleToToggle.isSaved || false);
      setTopicDetail((prevDetail) => {
        if (!prevDetail) return null;
        return {
          ...prevDetail,
          articles: prevDetail.articles.map((article) =>
            article.id === articleToToggle.id ? { ...article, isSaved: newIsSaved } : article
          ),
        };
      });
    } catch (error) {
      console.error("Failed to toggle save:", error);
    }
  };

  const handleCommentIconClick = async (article: Article) => {
    if (article.side === 'LEFT') {
      setLeftPanelArticle(article);
      setRightPanelArticle(null);
    } else if (article.side === 'RIGHT') {
      setRightPanelArticle(article);
      setLeftPanelArticle(null);
    }

    if (commentsByArticle[article.id]) {
      return;
    }

    setIsCommentsLoading(true);
    try {
      const { comments: fetchedComments } = await getComments(article.id, token || undefined);
      setCommentsByArticle(prev => ({ ...prev, [article.id]: fetchedComments }));
    } catch (err) {
      console.error(`Failed to fetch comments for article ${article.id}:`, err);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const handlePanelClose = (side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftPanelArticle(null);
    } else if (side === 'right') {
      setRightPanelArticle(null);
    }
  };

  const handleCommentCountUpdate = useCallback((articleId: number, newCount: number) => {
    setTopicDetail(prevDetail => {
      if (!prevDetail) return null;
      return {
        ...prevDetail,
        articles: prevDetail.articles.map(article =>
          article.id === articleId ? { ...article, comment_count: newCount } : article
        )
      };
    });
  }, []);

  const refetchComments = useCallback(async (article: Article) => {
    setIsCommentsLoading(true);
    try {
      const { comments: fetchedComments, totalCount } = await getComments(article.id, token || undefined);
      setCommentsByArticle(prev => ({ ...prev, [article.id]: fetchedComments }));
      handleCommentCountUpdate(article.id, totalCount);
    } catch (err) {
      console.error(`Failed to refetch comments for article ${article.id}:`, err);
    } finally {
      setIsCommentsLoading(false);
    }
  }, [token, handleCommentCountUpdate]);

  const handleCommentReaction = (
    commentId: number,
    updatedReaction: CommentReactionUpdate
  ) => {
    const activeArticleId = leftPanelArticle?.id || rightPanelArticle?.id;
    if (!activeArticleId) return;

    const updateComments = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, ...updatedReaction };
        }
        if (comment.children) {
          return { ...comment, children: updateComments(comment.children) };
        }
        return comment;
      });
    };

    setCommentsByArticle(prev => {
      const newCommentsForArticle = updateComments(prev[activeArticleId] || []);
      return { ...prev, [activeArticleId]: newCommentsForArticle };
    });
  };

  if (isLoading) {
    return <div className="text-center text-white p-10">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-10">{error}</div>;
  }

  if (!topicDetail) {
    return <div className="text-center text-white p-10">토픽 정보를 찾을 수 없습니다.</div>;
  }

  const { topic, articles } = topicDetail;
  const leftArticles = articles.filter((article) => article.side === "LEFT");
  const rightArticles = articles.filter((article) => article.side === "RIGHT");

  const leftComments = leftPanelArticle ? commentsByArticle[leftPanelArticle.id] || [] : [];
  const rightComments = rightPanelArticle ? commentsByArticle[rightPanelArticle.id] || [] : [];

  return (
    <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-0">
      {id && <TopicViewCounter topicId={id} />}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
        <aside className="lg:col-span-3 relative h-[600px] lg:h-[729px] overflow-hidden">
          <div className="space-y-6 h-full overflow-y-auto pr-2 pt-4 w-full">
            {leftArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="horizontal"
                onLikeToggle={() => handleLikeToggle(article)}
                onSaveToggle={() => handleSaveToggle(article)}
                onCommentIconClick={handleCommentIconClick}
                hoverColor="blue"
              />
            ))}
          </div>
          <CommentSidePanel
            isOpen={!!leftPanelArticle}
            onClose={() => handlePanelClose('left')}
            article={leftPanelArticle}
            comments={leftComments}
            isCommentsLoading={isCommentsLoading}
            onCommentCountUpdate={handleCommentCountUpdate}
            refetchComments={refetchComments}
            onCommentReaction={handleCommentReaction}
            side="left"
          />
        </aside>
        <main className="lg:col-span-6">
          <div className="border border-zinc-700 rounded-lg h-[600px] lg:h-[729px] flex flex-col">
            <div className="flex-1 min-h-0">
              <ChatRoom topic={topic} articles={articles} />
            </div>
          </div>
        </main>
        <aside className="lg:col-span-3 relative h-[600px] lg:h-[729px] overflow-hidden">
          <div className="space-y-6 h-full overflow-y-auto pr-2 pt-4 w-full">
            {rightArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="horizontal"
                onLikeToggle={() => handleLikeToggle(article)}
                onSaveToggle={() => handleSaveToggle(article)}
                onCommentIconClick={handleCommentIconClick}
                hoverColor="red"
              />
            ))}
          </div>
          <CommentSidePanel
            isOpen={!!rightPanelArticle}
            onClose={() => handlePanelClose('right')}
            article={rightPanelArticle}
            comments={rightComments}
            isCommentsLoading={isCommentsLoading}
            onCommentCountUpdate={handleCommentCountUpdate}
            refetchComments={refetchComments}
            onCommentReaction={handleCommentReaction}
            side="right"
          />
        </aside>
      </div>
      {id && <RelatedTopicsCarousel currentTopicId={id} />}
    </div>
  );
}