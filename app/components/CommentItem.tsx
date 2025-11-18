'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/app/context/AuthContext';
import { Send, Trash2, Loader2, Pencil, X, Check, MessageSquare, Ban, Flag } from 'lucide-react';
import Image from 'next/image';
import { formatDistanceToNow, isBefore, subHours, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import ReportModal from '@/app/components/common/ReportModal';
import ToastNotification, { ToastType } from '@/app/components/common/ToastNotification';

const getFullImageUrl = (url?: string): string => {
  if (!url) return '/user-placeholder.svg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
  return `${BACKEND_BASE_URL}${url}`;
};

const highlightMentions = (text: string) => {
  const parts = text.split(/(@[가-힣a-zA-Z0-9_]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return <span key={index} className="text-blue-400 font-semibold">{part}</span>;
    }
    return part;
  });
};

interface CommentHandlers {
  onUpdate: (commentId: number, text: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  onSetReplyTarget: (target: { id: number; nickname: string } | null) => void;
}

interface CommentItemProps {
  comment: Comment;
  handlers: CommentHandlers;
  depth: number; // Add depth prop
}

export default function CommentItem({ comment, handlers, depth }: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [areChildrenVisible, setAreChildrenVisible] = useState(true);
  const [editText, setEditText] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isReported, setIsReported] = useState(false); // To disable button after reporting

  const isAuthor = user ? user.id === comment.author_id : false;
  const isDeleted = comment.status === 'DELETED_BY_USER';

  const commentDate = new Date(comment.created_at);
  const now = new Date();
  const twentyFourHoursAgo = subHours(now, 24);
  const isOlderThan24Hours = isBefore(commentDate, twentyFourHoursAgo);

  const formattedTime = isOlderThan24Hours
    ? format(commentDate, 'yyyy-MM-dd HH:mm', { locale: ko })
    : formatDistanceToNow(commentDate, { addSuffix: true, locale: ko });

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

  const handleReportSuccess = (message: string, type: ToastType) => {
    setToast({ message, type });
    if (type === 'success' || message.includes('이미 신고')) { // Consider "already reported" as a success for disabling button
      setIsReported(true);
    }
    setTimeout(() => setToast(null), 3000); // Hide toast after 3 seconds
  };

  const renderChildren = () => {
    if (!areChildrenVisible || !comment.children || comment.children.length === 0) {
      return null;
    }

    const childrenWrapperClasses = depth === 0
      ? "pt-2 pl-6 border-l-2 border-zinc-700/50 bg-zinc-800/50 p-3 rounded-lg mt-2 space-y-2"
      : "pt-2 space-y-2"; // No additional indentation for deeper replies

    return (
      <div className={childrenWrapperClasses}>
        {comment.children.map((childComment, index) => (
          <div key={childComment.id}>
            {index > 0 && <div className="border-t border-zinc-700 pt-2 mt-2" />}
            <CommentItem comment={childComment} handlers={handlers} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  };

  const itemClasses = `py-2`;

  if (isDeleted) {
    if (!comment.children || comment.children.length === 0) {
      return null; // Completely remove from UI if deleted and has no children
    }
    // Otherwise, render as a deleted comment with children
    return (
      <div className={itemClasses}>
        <div className="flex items-center gap-3 text-zinc-500 italic">
          <Ban size={16} className="shrink-0" />
          <div className="flex-1">
            <p className="text-sm">삭제된 댓글입니다.</p>
            {comment.children && comment.children.length > 0 && (
              <button 
                onClick={() => setAreChildrenVisible(!areChildrenVisible)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-400 mt-1"
              >
                <MessageSquare size={14} />
                <span>답글 보기 ({comment.children.length})</span>
              </button>
            )}
          </div>
        </div>
        {renderChildren()}
      </div>
    );
  }

  return (
    <div className={itemClasses}>
      <div className="flex items-start gap-3 group">
        <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-zinc-700 mt-1">
          <Image
            src={getFullImageUrl(comment.avatar_url)}
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
              {formattedTime}
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
            <p className="text-sm text-zinc-300 whitespace-pre-wrap py-1">{highlightMentions(comment.content)}</p>
          )}

          <div className="flex items-center gap-4 mt-1">
            <button 
              onClick={() => handlers.onSetReplyTarget({ id: comment.id, nickname: comment.author_name })}
              className="text-xs text-zinc-400 hover:text-white"
            >
              답글
            </button>

            {depth === 0 && comment.children && comment.children.length > 0 && (
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
            {!isAuthor && ( // Only show report button if not author
              <>
                <span className="text-zinc-600 mx-1">·</span>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="text-xs text-zinc-400 hover:text-yellow-500 disabled:text-zinc-600 disabled:cursor-not-allowed flex items-center gap-1"
                  title="댓글 신고"
                  disabled={isReported}
                >
                  <Flag size={14} />
                  {isReported ? '신고됨' : '신고'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {renderChildren()}

      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          reportType="comment"
          targetId={comment.id}
          onReportSuccess={handleReportSuccess}
        />
      )}

      {toast && createPortal(
        <div className="fixed bottom-4 right-4 z-[9999]">
          <ToastNotification
            id="comment-report-toast"
            message={toast.message}
            type={toast.type}
            onDismiss={() => setToast(null)}
            duration={3000}
          />
        </div>,
        document.body
      )}
    </div>
  );
}