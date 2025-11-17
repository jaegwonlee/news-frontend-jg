'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Comment } from '@/types';
import { Send, Trash2, Loader2, Pencil, X, Check, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const getFullImageUrl = (url?: string): string => {
  if (!url) return '/user-placeholder.svg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  return `${BACKEND_BASE_URL}${url}`;
};

interface CommentHandlers {
  onUpdate: (commentId: number, text: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  onReply: (parentId: number, text: string) => Promise<void>;
}

interface CommentItemProps {
  comment: Comment;
  handlers: CommentHandlers;
}

export default function CommentItem({ comment, handlers }: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [areChildrenVisible, setAreChildrenVisible] = useState(true); // Default to true
  const [editText, setEditText] = useState(comment.content);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthor = user ? user.id === comment.author_id : false;

  const handleEdit = async () => {
    if (!editText.trim()) return;
    setIsSubmitting(true);
    await handlers.onUpdate(comment.id, editText);
    setIsSubmitting(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      await handlers.onDelete(comment.id);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    await handlers.onReply(comment.id, replyText);
    setIsSubmitting(false);
    setReplyText('');
    setIsReplying(false);
    setAreChildrenVisible(true); // Show replies after posting a new one
  };

  return (
    <div className={`flex items-start gap-3 group ${comment.parent_id ? 'bg-zinc-800/50 p-3 rounded-lg' : ''}`}>
      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-zinc-700 mt-1">
        <Image
          src={getFullImageUrl(comment.author_profile_image_url)}
          alt={comment.author_name || 'User profile image'}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-zinc-200">{comment.author_name}</span>
          <span className="text-xs text-zinc-500">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
          </span>
        </div>

        {isEditing ? (
          <div className="mt-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-sm text-white"
              rows={2}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsEditing(false)} className="p-1 text-zinc-400 hover:text-white" title="취소"><X size={16} /></button>
              <button onClick={handleEdit} disabled={isSubmitting} className="p-1 text-green-500 hover:text-green-400 disabled:text-zinc-600" title="저장">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-300 whitespace-pre-wrap py-1">{comment.content}</p>
        )}

        {!isEditing && (
          <div className="flex items-center gap-4 mt-1">
            <button 
              onClick={() => setIsReplying(!isReplying)} 
              className={`text-xs text-zinc-400 hover:text-white ${comment.parent_id ? 'invisible' : ''}`}
            >
              답글
            </button>

            {comment.children && comment.children.length > 0 && (
              <button 
                onClick={() => setAreChildrenVisible(!areChildrenVisible)}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
              >
                <MessageSquare size={14} />
                <span>{comment.children.length}</span>
              </button>
            )}

            {isAuthor && (
              <div className="flex items-center">
                <button onClick={() => setIsEditing(true)} className="text-xs text-zinc-400 hover:text-white">수정</button>
                <span className="text-zinc-600 mx-1">·</span>
                <button onClick={handleDelete} className="text-xs text-zinc-400 hover:text-red-500">삭제</button>
              </div>
            )}
          </div>
        )}

        {isReplying && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`${comment.author_name}에게 답글 작성...`}
              className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={!user || isSubmitting}
              autoFocus
            />
            <button onClick={handleReply} disabled={!user || !replyText.trim() || isSubmitting} className="p-2 bg-blue-600 rounded-md text-white transition-colors disabled:bg-zinc-700 disabled:cursor-not-allowed hover:bg-blue-700">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        )}

        {areChildrenVisible && comment.children && comment.children.length > 0 && (
          <div className="mt-4 space-y-4 pl-6 border-l-2 border-zinc-700/50">
            {comment.children.map(childComment => (
              <CommentItem key={childComment.id} comment={childComment} handlers={handlers} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}