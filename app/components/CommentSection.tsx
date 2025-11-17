'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getComments, addComment, deleteComment, updateComment } from '@/lib/api/comments';
import { Comment } from '@/types';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  articleId: number;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('latest');

  const fetchComments = useCallback(async () => {
    try {
      // Don't set loading to true on re-fetch to avoid flicker
      const { comments: fetchedComments, totalCount: fetchedTotalCount } = await getComments(articleId, token || undefined, sortBy);
      setComments(fetchedComments);
      setTotalCount(fetchedTotalCount);
    } catch (err) {
      setError('댓글을 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [articleId, token, sortBy]);

  useEffect(() => {
    setIsLoading(true);
    fetchComments();
  }, [fetchComments]);

  const handleSubmitTopLevelComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;

    setIsSubmitting(true);
    try {
      await addComment(articleId, newComment, token);
      setNewComment('');
      if (sortBy !== 'latest') {
        setSortBy('latest');
      } else {
        await fetchComments();
      }
    } catch (err) {
      setError('댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlers = {
    onUpdate: async (commentId: number, text: string) => {
      if (!text.trim() || !token) return;
      await updateComment(commentId, text, token);
      await fetchComments();
    },
    onDelete: async (commentId: number) => {
      if (!token) return;
      await deleteComment(commentId, token);
      await fetchComments();
    },
    onReply: async (parentId: number, text: string) => {
      if (!text.trim() || !token) return;
      try {
        await addComment(articleId, text, token, parentId);
        if (sortBy !== 'latest') {
          setSortBy('latest');
        } else {
          await fetchComments();
        }
      } catch (err) {
        setError('답글 작성에 실패했습니다.');
      }
    },
  };

  const SortTab = ({ value, label }: { value: string, label: string }) => (
    <button
      onClick={() => setSortBy(value)}
      className={`px-3 py-1 text-sm rounded-md transition-colors ${
        sortBy === value
          ? 'bg-blue-600 text-white'
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="text-sm text-white">총 <span className="font-bold text-blue-400">{totalCount}</span>개</div>
        <div className="flex items-center gap-2">
          <SortTab value="latest" label="최신순" />
          <SortTab value="oldest" label="과거순" />
          <SortTab value="popular" label="공감순" />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-zinc-500"><MessageSquare size={32} className="mb-2" /><p>아직 댓글이 없습니다.</p></div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} handlers={handlers} />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 pt-4 mt-auto">
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmitTopLevelComment} className="flex items-center gap-2">
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
      </div>
    </div>
  );
}