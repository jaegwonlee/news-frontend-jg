"use client";

import { Button } from "@/app/components/common/Button";
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
  const [error, setError] = useState<string | null>(null);

  // ... (fetchComments logic remains same)

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
      // Always use the user's vote stance when posting
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
      // Instead of removing, we soft delete (mark as DELETED_BY_USER)
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
            // Cancel reaction
            if (type === "LIKE") newLikeCount--;
            else newDislikeCount--;
          } else {
            // New reaction
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
    if (reason === null) return; // Cancelled
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

  const filteredComments = comments.filter((c) => stance === "NEUTRAL" || c.stance === stance);

  return (
    <div className="py-6 relative">
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">의견 ({comments.length})</h3>
        <div className="flex space-x-2 p-1 bg-background rounded-lg border border-border">
          {(["ALL", "LEFT", "RIGHT"] as const).map((s) => {
            const isActive = stance === s || (s === "ALL" && stance === "NEUTRAL");
            const getVariant = () => {
              if (s === "ALL") return isActive ? "secondary" : "ghost";
              if (s === "LEFT") return isActive ? "default" : "ghost";
              if (s === "RIGHT") return isActive ? "destructive" : "ghost";
            };
            return (
              <Button
                key={s}
                variant={getVariant()}
                onClick={() => setStance(s === "ALL" ? "NEUTRAL" : s)}
                className="flex-1 text-center py-2 rounded-md font-medium transition-all"
              >
                {s === "LEFT" ? "이해한다" : s === "RIGHT" ? "민폐이다" : "전체"}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        {user && <CommentInput onSubmit={handlePostComment} />}
        {!userVoteStance && user && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4 border rounded-lg border-border">
            <p className="text-lg font-bold mb-2">투표 후 의견을 남길 수 있습니다.</p>
            <p className="text-sm text-muted-foreground">상단에서 입장을 선택해주세요.</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-border">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p className="text-destructive text-center">{error}</p>
        ) : (
          <div className="space-y-4">
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
              <p className="text-muted-foreground text-center py-8">아직 의견이 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
