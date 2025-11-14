'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getComments, addComment, deleteComment } from '@/lib/api/comments';
import { Comment } from '@/types';
import { Send, Trash2, Loader2, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CommentSectionProps {
  articleId: number;
}

const getFullImageUrl = (url?: string): string => {
  if (!url) return '/user-placeholder.svg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Assuming BACKEND_BASE_URL is available or defined elsewhere
  const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  return `${BACKEND_BASE_URL}${url}`;
};

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedComments = await getComments(articleId, token);
      setComments(fetchedComments);
    } catch (err) {
      setError('댓글을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [articleId, token]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;

    setIsSubmitting(true);
    try {
      const addedComment = await addComment(articleId, newComment, token);
      setComments((prev) => [addedComment, ...prev]);
      setNewComment('');
    } catch (err) {
      setError('댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) return;
    
    // Optimistic deletion
    const originalComments = comments;
    setComments(prev => prev.filter(c => c.id !== commentId));

    try {
      await deleteComment(commentId, token);
    } catch (err) {
      setError('댓글 삭제에 실패했습니다.');
      // Rollback on error
      setComments(originalComments);
    }
  };

  return (
    <div className="bg-zinc-900/50 p-4 rounded-b-lg mt-2">
      <form onSubmit={handleSubmitComment} className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? '댓글을 입력하세요...' : '로그인 후 댓글을 작성할 수 있습니다.'}
          className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!user || isSubmitting}
        />
        <button
          type="submit"
          disabled={!user || !newComment.trim() || isSubmitting}
          className="p-2 bg-blue-600 rounded-md text-white transition-colors disabled:bg-zinc-700 disabled:cursor-not-allowed hover:bg-blue-700"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-zinc-500 py-4">
            <MessageSquare size={32} className="mx-auto mb-2" />
            <p>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3 group">
              <Image
                src={getFullImageUrl(comment.author_profile_image_url)}
                alt={comment.author_name}
                width={32}
                height={32}
                className="rounded-full mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-zinc-200">{comment.author_name}</span>
                  <span className="text-xs text-zinc-500">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{comment.content}</p>
              </div>
              {comment.is_author && (
                <button 
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  title="삭제"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
