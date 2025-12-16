"use client";

import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import { useAuth } from "@/app/context/AuthContext";
import {
  deleteTopicComment,
  getTopicComments,
  postTopicComment,
  reportTopicComment,
  toggleTopicCommentReaction,
  updateTopicComment,
} from "@/lib/api";
import { Comment } from "@/lib/types/comment";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import CommentInput from "./CommentInput";
import TopicCommentItem from "./TopicCommentItem";

interface TopicCommentSectionProps {
  topicId: string;
  userVoteStance: "LEFT" | "RIGHT" | null;
  stanceLeft: string;
  stanceRight: string;
}

export default function TopicCommentSection({
  topicId,
  userVoteStance,
  stanceLeft,
  stanceRight,
}: TopicCommentSectionProps) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stance, setStance] = useState<"LEFT" | "RIGHT" | "NEUTRAL">("NEUTRAL"); // Filter stance
  const [sortBy, setSortBy] = useState<"LATEST" | "OLDEST" | "LIKES" | "REPLIES">("LATEST");

  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTopicComments(topicId, token || undefined);
      setComments(data.comments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      setError("댓글을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [topicId, token]);

  // Use useEffect to fetch comments on mount
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const updateLocalComment = (updatedComment: Comment) => {
    const update = (items: Comment[]): Comment[] => {
      return items.map((item) => {
        if (item.id === updatedComment.id) return { ...item, ...updatedComment };
        if (item.children) return { ...item, children: update(item.children) };
        return item;
      });
    };
    setComments((prev) => update(prev));
  };

  const softDeleteLocalComment = (commentId: number) => {
    const updateStatus = (items: Comment[]): Comment[] => {
      return items.map((item) => {
        if (item.id === commentId) {
          return { ...item, status: "DELETED_BY_USER" };
        }
        if (item.children) {
          return { ...item, children: updateStatus(item.children) };
        }
        return item;
      });
    };
    setComments((prev) => updateStatus(prev));
  };

  const handlePostComment = async (content: string, parentId: number | null) => {
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!userVoteStance) {
      alert("투표를 먼저 진행해야 의견을 남길 수 있습니다.");
      return;
    }

    try {
      await postTopicComment(topicId, content, parentId, userVoteStance, token);
      await fetchComments();
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert((error as Error).message);
    }
  };

  const handleEditComment = async (commentId: number, content: string) => {
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const updated = await updateTopicComment(commentId, content, token);
      updateLocalComment(updated);
    } catch (error) {
      console.error("Failed to edit comment:", error);
      alert((error as Error).message);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteTopicComment(commentId, token);
      softDeleteLocalComment(commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert((error as Error).message);
    }
  };

  const handleReaction = async (commentId: number, type: "LIKE" | "DISLIKE") => {
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    // Optimistic UI Update
    const toggleReaction = (items: Comment[]): Comment[] => {
      return items.map((item) => {
        if (item.id === commentId) {
          const isSameReaction = item.my_reaction === type;
          const newReaction = isSameReaction ? null : type;

          let newLikeCount = item.like_count || 0;
          let newDislikeCount = item.dislike_count || 0;

          if (isSameReaction) {
            if (type === "LIKE") newLikeCount--;
            else newDislikeCount--;
          } else {
            if (type === "LIKE") {
              newLikeCount++;
              if (item.my_reaction === "DISLIKE") newDislikeCount--;
            } else {
              newDislikeCount++;
              if (item.my_reaction === "LIKE") newLikeCount--;
            }
          }

          return {
            ...item,
            my_reaction: newReaction,
            like_count: newLikeCount,
            dislike_count: newDislikeCount,
          };
        }
        if (item.children) {
          return { ...item, children: toggleReaction(item.children) };
        }
        return item;
      });
    };

    setComments((prev) => toggleReaction(prev));

    try {
      await toggleTopicCommentReaction(commentId, type, token);
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
      alert("반응 처리에 실패했습니다.");
      fetchComments();
    }
  };

  const handleReport = async (commentId: number) => {
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const reason = prompt("신고 사유를 입력해주세요:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("신고 사유를 입력해야 합니다.");
      return;
    }

    try {
      await reportTopicComment(commentId, reason, token);
      alert("신고가 접수되었습니다.");
    } catch (error) {
      console.error("Failed to report comment:", error);
      alert((error as Error).message);
    }
  };

  const filteredComments = comments
    .filter((c) => stance === "NEUTRAL" || c.stance === stance)
    .sort((a, b) => {
      switch (sortBy) {
        case "LATEST":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "OLDEST":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "LIKES":
          return (b.like_count || 0) - (a.like_count || 0);
        case "REPLIES":
          return (b.children?.length || 0) - (a.children?.length || 0);
        default:
          return 0;
      }
    });

  const allCount = comments.length;

  return (
    <div className="py-8 relative animate-fade-in transition-colors duration-300">
      {/* 1. Header & Filters */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black italic uppercase flex items-center gap-3 tracking-tighter">
            <span className="text-black dark:text-white">Live Discussion</span>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border border-zinc-200 dark:border-zinc-700">
              {allCount}
            </span>
          </h3>

          {/* Sort Dropdown - Minimalist */}
          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "LATEST" | "OLDEST" | "LIKES" | "REPLIES")}
              className="appearance-none bg-transparent text-sm font-bold text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white cursor-pointer outline-none pr-6 text-right transition-colors"
            >
              <option value="LATEST">최신순</option>
              <option value="OLDEST">오래된순</option>
              <option value="LIKES">공감순</option>
              <option value="REPLIES">답글순</option>
            </select>
          </div>
        </div>

        {/* Stance Filters - Modern Pill Design */}
        <div className="flex items-center p-1.5 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl w-full sm:w-auto self-start border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
          {(["ALL", "LEFT", "RIGHT"] as const).map((s) => {
            const isActive = stance === s || (s === "ALL" && stance === "NEUTRAL");

            let label = "전체보기";
            if (s === "LEFT") label = `🔵 ${stanceLeft}`;
            if (s === "RIGHT") label = `🔴 ${stanceRight}`;

            return (
              <button
                key={s}
                onClick={() => setStance(s === "ALL" ? "NEUTRAL" : s)}
                className={cn(
                  "flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                  isActive
                    ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md shadow-black/5 ring-1 ring-black/5 dark:ring-white/10 scale-[1.02]"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Input Area */}
      <div className="relative mb-12 z-20">
        {user && <CommentInput onSubmit={handlePostComment} />}
        {!userVoteStance && user && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center p-6 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-white/10 dark:bg-zinc-900/40 backdrop-blur-md" />
            <div className="relative z-10 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 transform shadow-black/20">
              <span className="text-4xl mb-3 block">🗳️</span>
              <p className="text-lg font-black text-black dark:text-white mb-1">참여가 필요합니다</p>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                투표를 완료하고 토론에 참여해보세요!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Comment Stream */}
      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center pt-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredComments.map((comment) => (
              <TopicCommentItem
                key={comment.id}
                comment={comment}
                onPostReply={handlePostComment}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onReaction={handleReaction}
                onReport={handleReport}
                stanceLeft={stanceLeft}
                stanceRight={stanceRight}
              />
            ))}
            {filteredComments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-4xl grayscale">
                  💬
                </div>
                <h4 className="text-xl font-black text-black dark:text-white mb-2">아직 댓글이 없습니다</h4>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">첫 번째 의견의 주인공이 되어보세요!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
