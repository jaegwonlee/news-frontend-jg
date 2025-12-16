"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Comment } from "@/lib/types/comment";
import { cn, formatRelativeTime, getFullImageUrl } from "@/lib/utils";
import { Edit, Flag, MoreVertical, ThumbsDown, ThumbsUp, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import CommentInput from "./CommentInput";

interface TopicCommentItemProps {
  comment: Comment;
  onPostReply: (content: string, parentId: number | null) => Promise<void>;
  onEdit: (commentId: number, content: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  onReaction: (commentId: number, type: "LIKE" | "DISLIKE") => Promise<void>;
  onReport: (commentId: number) => Promise<void>;
  level?: number; // Tracking nesting level for visuals
  stanceLeft: string;
  stanceRight: string;
}

export default function TopicCommentItem({
  comment,
  onPostReply,
  onEdit,
  onDelete,
  onReaction,
  onReport,
  level = 0,
  stanceLeft,
  stanceRight,
}: TopicCommentItemProps) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAuthor = user?.id && comment.author_id ? Number(user.id) === Number(comment.author_id) : false;

  // Colors based on stance
  const isLeft = comment.stance === "LEFT";
  const isRight = comment.stance === "RIGHT";

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditSubmit = async (content: string) => {
    await onEdit(comment.id, content);
    setIsEditing(false);
    setShowMenu(false);
  };

  const handleReplySubmit = async (content: string, parentId: number | null) => {
    await onPostReply(content, parentId);
    setIsReplying(false);
  };

  return (
    <div className={cn("relative group transition-all duration-300", level > 0 ? "mt-5" : "")}>
      {/* Thread Visual Connector for nested comments - More subtle/premium */}
      {level > 0 && (
        <div className="absolute -top-6 -left-4 w-5 h-[calc(100%+20px)] border-l border-b border-zinc-200 dark:border-zinc-800 rounded-bl-3xl pointer-events-none" />
      )}

      <div className={cn("flex gap-4", level > 0 ? "ml-6 md:ml-10" : "")}>
        {/* Avatar Section */}
        <div className="shrink-0 relative">
          <div
            className={cn(
              "rounded-full p-0.5 transition-transform hover:scale-105",
              isLeft
                ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                : isRight
                ? "bg-gradient-to-br from-red-500 to-orange-600"
                : "bg-transparent"
            )}
          >
            <Image
              src={getFullImageUrl(comment.profile_image_url)}
              alt={comment.author_name}
              width={level > 0 ? 32 : 40}
              height={level > 0 ? 32 : 40}
              className={cn(
                "rounded-full object-cover bg-zinc-100 dark:bg-zinc-800",
                isLeft || isRight
                  ? "border-2 border-white dark:border-zinc-900"
                  : "border border-zinc-200 dark:border-zinc-700"
              )}
            />
          </div>
        </div>

        {/* Main Content Card */}
        <div className="flex-1 min-w-0">
          {/* Header: Name + Meta */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-black text-[15px] text-black dark:text-white">{comment.author_name}</span>

            {(isLeft || isRight) && (
              <span
                className={cn(
                  "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border",
                  isLeft
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800"
                    : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800"
                )}
              >
                {isLeft ? "BLUE" : "RED"}
              </span>
            )}

            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>

          {/* Comment Bubble */}
          <div className="relative group/bubble">
            {/* Bubble Body */}
            <div
              className={cn(
                "rounded-b-2xl rounded-tr-2xl py-3 px-4 text-[15px] leading-7 shadow-sm border transition-colors relative",
                isAuthor
                  ? "bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/50"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              )}
            >
              {/* Top-left corner fix for bubble shape */}
              <div
                className={cn(
                  "absolute -top-px -left-px w-4 h-4 rounded-tl-xl border-t border-l",
                  isAuthor
                    ? "bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/50"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                )}
              />

              {/* Content Text */}
              <div className="text-black dark:text-white relative z-10">
                {!isEditing ? (
                  <>
                    {comment.status === "DELETED_BY_USER" || comment.status === "DELETED_BY_ADMIN" ? (
                      <span className="italic text-zinc-400 flex items-center gap-2 py-1">
                        <Trash size={14} /> 삭제된 댓글입니다.
                      </span>
                    ) : comment.status === "HIDDEN" ? (
                      <span className="italic text-zinc-400 flex items-center gap-2 py-1">
                        <Flag size={14} /> 신고에 의해 숨겨진 댓글입니다.
                      </span>
                    ) : (
                      <span className="whitespace-pre-wrap">{comment.content}</span>
                    )}
                  </>
                ) : (
                  <CommentInput
                    onSubmit={(content) => handleEditSubmit(content)}
                    initialContent={comment.content}
                    onCancel={() => setIsEditing(false)}
                    parentId={comment.id}
                    placeholder="댓글 수정..."
                  />
                )}
              </div>
            </div>

            {/* Actions Footer */}
            {!isEditing && (!comment.status || comment.status === "ACTIVE") && (
              <div className="flex items-center justify-between mt-2 pl-1">
                <div className="flex items-center gap-4">
                  {/* Likes */}
                  <button
                    onClick={() => !isAuthor && onReaction(comment.id, "LIKE")}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-bold transition-colors group/btn",
                      comment.my_reaction === "LIKE"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-zinc-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400"
                    )}
                  >
                    <ThumbsUp
                      size={14}
                      className={cn(
                        "group-hover/btn:scale-110 transition-transform",
                        comment.my_reaction === "LIKE" ? "fill-current" : ""
                      )}
                    />
                    <span>{comment.like_count || 0}</span>
                  </button>

                  {/* Dislikes */}
                  <button
                    onClick={() => !isAuthor && onReaction(comment.id, "DISLIKE")}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-bold transition-colors group/btn",
                      comment.my_reaction === "DISLIKE"
                        ? "text-red-600 dark:text-red-400"
                        : "text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
                    )}
                  >
                    <ThumbsDown
                      size={14}
                      className={cn(
                        "group-hover/btn:scale-110 transition-transform top-0.5 relative",
                        comment.my_reaction === "DISLIKE" ? "fill-current" : ""
                      )}
                    />
                    <span>{comment.dislike_count || 0}</span>
                  </button>

                  {/* Reply */}
                  <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="text-xs font-bold text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors ml-1"
                  >
                    답글 {isReplying ? "취소" : "쓰기"}
                  </button>
                </div>

                {/* Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="opacity-0 group-hover:opacity-100 group-hover/bubble:opacity-100 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 transition-all"
                  >
                    <MoreVertical size={14} />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      {isAuthor ? (
                        <>
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowMenu(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-2"
                          >
                            <Edit size={12} /> 수정
                          </button>
                          <button
                            onClick={() => {
                              onDelete(comment.id);
                              setShowMenu(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 flex items-center gap-2"
                          >
                            <Trash size={12} /> 삭제
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            onReport(comment.id);
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 flex items-center gap-2"
                        >
                          <Flag size={12} /> 신고
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Nested Reply Input */}
            {isReplying && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                <CommentInput
                  onSubmit={handleReplySubmit}
                  onCancel={() => setIsReplying(false)}
                  parentId={comment.id}
                  placeholder={`@${comment.author_name} 에게 답글 남기기...`}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recursive Children (Replies) */}
      {comment.children && comment.children.length > 0 && (
        <div className="w-full">
          {comment.children.map((child) => (
            <TopicCommentItem
              key={child.id}
              comment={child}
              onPostReply={onPostReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReaction={onReaction}
              onReport={onReport}
              level={level + 1}
              stanceLeft={stanceLeft}
              stanceRight={stanceRight}
            />
          ))}
        </div>
      )}
    </div>
  );
}
