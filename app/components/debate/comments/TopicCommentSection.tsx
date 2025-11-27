"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Comment, CommentReactionUpdate } from "@/types";
import { 
    getTopicComments, 
    postTopicComment,
    updateTopicComment,
    deleteTopicComment,
    reactToTopicComment,
} from "@/lib/api";
import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import TopicCommentItem from "./TopicCommentItem";
import CommentInput from "./CommentInput";
import { Button } from "@/app/components/common/Button";

interface TopicCommentSectionProps {
  topicId: string;
}

export default function TopicCommentSection({ topicId }: TopicCommentSectionProps) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stance, setStance] = useState<'LEFT' | 'RIGHT' | 'NEUTRAL'>('NEUTRAL');
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTopicComments(topicId, token || undefined);
      const commentsMap = new Map(data.comments.map(c => [c.id, { ...c, children: [] as Comment[] }]));
      const nestedComments: Comment[] = [];
      data.comments.forEach(c => {
        const commentWithChildren = commentsMap.get(c.id);
        if (commentWithChildren) {
          if (c.parent_id && commentsMap.has(c.parent_id)) {
            commentsMap.get(c.parent_id)?.children?.push(commentWithChildren);
          } else {
            nestedComments.push(commentWithChildren);
          }
        }
      });
      setComments(nestedComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setError("댓글을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [topicId, token]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const updateLocalComment = (updatedComment: Comment) => {
    const update = (items: Comment[]): Comment[] => {
      return items.map(item => {
        if (item.id === updatedComment.id) return { ...item, ...updatedComment };
        if (item.children) return { ...item, children: update(item.children) };
        return item;
      });
    };
    setComments(prev => update(prev));
  };
  
  const removeLocalComment = (commentId: number) => {
    const remove = (items: Comment[]): Comment[] => {
        return items.filter(item => item.id !== commentId).map(item => {
            if (item.children) return { ...item, children: remove(item.children) };
            return item;
        })
    };
    setComments(prev => remove(prev));
  };

  const handlePostComment = async (content: string, parentId: number | null) => {
    if (!token) { alert("로그인이 필요합니다."); return; }
    try {
      await postTopicComment(topicId, content, parentId, stance, token);
      await fetchComments(); // Re-fetch all comments to get the correct structure
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert((error as Error).message);
    }
  };

  const handleEditComment = async (commentId: number, content: string) => {
    if (!token) { alert("로그인이 필요합니다."); return; }
    try {
      const updated = await updateTopicComment(commentId, content, token);
      updateLocalComment(updated);
    } catch (error) {
      console.error("Failed to edit comment:", error);
      alert((error as Error).message);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) { alert("로그인이 필요합니다."); return; }
    if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteTopicComment(commentId, token);
      removeLocalComment(commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert((error as Error).message);
    }
  };
  
  const handleReactToComment = async (commentId: number, reaction: 'LIKE' | 'DISLIKE') => {
      if (!token) { alert("로그인이 필요합니다."); return; }
      try {
          const updatedReaction: CommentReactionUpdate = await reactToTopicComment(commentId, reaction, token);
          const tempUpdatedComment = {id: commentId, ...updatedReaction} as Comment;
          updateLocalComment(tempUpdatedComment);
      } catch(error) {
          console.error("Failed to react to comment:", error);
          alert((error as Error).message);
      }
  };
  
  const filteredComments = comments.filter(c => stance === 'NEUTRAL' || c.stance === stance);

  return (
    <div className="py-6">
      <div className="mb-6 p-1 bg-secondary rounded-lg flex">
        {(['LEFT', 'RIGHT', 'NEUTRAL'] as const).map(s => (
          <Button 
            key={s}
            variant={stance === s ? 'default' : 'ghost'} 
            onClick={() => setStance(s)}
            className="flex-1"
          >
            {s === 'LEFT' ? '찬성' : s === 'RIGHT' ? '반대' : '전체'}
          </Button>
        ))}
      </div>

      <h3 className="text-lg font-bold mb-4">
        의견 남기기 ({stance === 'LEFT' ? '찬성' : stance === 'RIGHT' ? '반대' : '중립'})
      </h3>
      
      {user && <CommentInput onSubmit={handlePostComment} />}

      <div className="mt-8 pt-4 border-t border-border">
        {isLoading ? (
          <div className="flex justify-center p-8"><LoadingSpinner /></div>
        ) : error ? (
            <p className="text-destructive text-center">{error}</p>
        ) : (
          <div className="space-y-4">
            {filteredComments.map(comment => (
              <TopicCommentItem 
                key={comment.id}
                comment={comment}
                onPostReply={handlePostComment}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onReact={handleReactToComment}
              />
            ))}
            {filteredComments.length === 0 && <p className="text-muted-foreground text-center py-8">아직 의견이 없습니다.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
