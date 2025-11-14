'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Comment } from '@/types';
import { Send, Trash2, Loader2, Pencil, X, Check, CornerDownRight } from 'lucide-react';
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
  const [areChildrenVisible, setAreChildrenVisible] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = async () => {
    setIsSubmitting(true);
    await handlers.onUpdate(comment.id, editText);
    setIsSubmitting(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await handlers.onDelete(comment.id);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    setAreChildrenVisible(true); // Set visible before awaiting, to ensure it's open on re-render
    await handlers.onReply(comment.id, replyText);
    setIsSubmitting(false);
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div className={`flex items-start gap-3 group ${comment.parent_id ? 'bg-zinc-800/50 p-2 rounded-lg' : ''}`}>
      <Image
        src={getFullImageUrl(comment.author_profile_image_url)}
        alt={comment.author_name || 'User profile image'}
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

        {isEditing ? (
          <div className="mt-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded-md text-sm text-white"
              rows={2}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsEditing(false)} className="p-1 text-zinc-400 hover:text-white"><X size={16} /></button>
              <button onClick={handleEdit} disabled={isSubmitting} className="p-1 text-green-500 hover:text-green-400 disabled:text-zinc-600">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-300 whitespace-pre-wrap">{comment.content}</p>
        )}

        {!isEditing && (
          <div className="flex items-center gap-4 mt-1">
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              답글
            </button>
            {comment.is_author && (
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

        {comment.children && comment.children.length > 0 && (
          <button 
            onClick={() => setAreChildrenVisible(!areChildrenVisible)}
            className="mt-2 flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
          >
            <CornerDownRight size={16} />
            <span>
              {areChildrenVisible ? '답글 숨기기' : `답글 ${comment.children.length}개 보기`}
            </span>
          </button>
        )}

        {areChildrenVisible && comment.children && comment.children.length > 0 && (
          <div className="mt-4 space-y-4 pl-8 border-l-2 border-zinc-700">
            {comment.children.map(childComment => (
              <CommentItem key={childComment.id} comment={childComment} handlers={handlers} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
