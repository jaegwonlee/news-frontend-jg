'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getComments, addComment, deleteComment, updateComment } from '@/lib/api/comments';
import { Comment } from '@/types';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  articleId: number;
  onCommentCountChange: (count: number) => void;
}

// Utility to build a nested tree from a flat list of comments
const buildTree = (comments: Comment[]): Comment[] => {
  const commentsById: { [key: number]: Comment } = {};
  comments.forEach(comment => {
    commentsById[comment.id] = { ...comment, children: [] };
  });

  const tree: Comment[] = [];
  comments.forEach(comment => {
    if (comment.parent_id && commentsById[comment.parent_id]) {
      commentsById[comment.parent_id].children?.push(commentsById[comment.id]);
    } else {
      tree.push(commentsById[comment.id]);
    }
  });

  return tree;
};

export default function CommentSection({ articleId, onCommentCountChange }: CommentSectionProps) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndBuildTree = useCallback(async () => {
    try {
      // We don't set loading to true here to prevent UI flicker on re-fetch
      const flatComments = await getComments(articleId, token);
      const commentTree = buildTree(flatComments);
      setComments(commentTree);
      onCommentCountChange(flatComments.length); // Update count based on flat list length
    } catch (err) {
      setError('댓글을 불러오는 데 실패했습니다.');
      console.error(err);
    }
  }, [articleId, token, onCommentCountChange]);

  // Initial fetch
  useEffect(() => {
    setIsLoading(true);
    fetchAndBuildTree().finally(() => setIsLoading(false));
  }, [fetchAndBuildTree]);

  const handleSubmitTopLevelComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;

    setIsSubmitting(true);
    try {
      await addComment(articleId, newComment, token);
      setNewComment('');
      await fetchAndBuildTree(); // Re-fetch to get the most accurate data
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
      await fetchAndBuildTree(); // Re-fetch
    },
    onDelete: async (commentId: number) => {
      if (!token) return;
      await deleteComment(commentId, token);
      await fetchAndBuildTree(); // Re-fetch
    },
    onReply: async (parentId: number, text: string) => {
      if (!text.trim() || !token) return;
      await addComment(articleId, text, token, parentId);
      await fetchAndBuildTree(); // Re-fetch
    },
  };

  return (
    <div className="bg-zinc-900/50 p-4 rounded-b-lg mt-2">
      <form onSubmit={handleSubmitTopLevelComment} className="flex items-center gap-2 mb-4">
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

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
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
            <CommentItem key={comment.id} comment={comment} handlers={handlers} />
          ))
        )}
      </div>
    </div>
  );
}
