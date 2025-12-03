"use client";

import { useAuth } from "@/app/context/AuthContext";
import { 
    getTopicComments,
    postTopicComment,
    updateTopicComment,
    deleteTopicComment
} from "@/lib/api/topicComments";
import { Comment } from "@/lib/types/comment";
import { Topic } from "@/lib/types/topic";
import {
  Loader2,
  MessageSquareText,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import TopicCommentItem from "./debate/comments/TopicCommentItem";
import CommentInput from "./debate/comments/CommentInput";

interface ChatRoomProps {
  topic?: Topic;
}

export default function ChatRoom({ topic }: ChatRoomProps) {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(!!topic?.id);

  const topicId = topic?.id.toString();

  const loadComments = useCallback(async () => {
    if (!topicId) return;
    setIsLoading(true);
    try {
      const { comments: fetchedComments } = await getTopicComments(topicId, token);
      setComments(fetchedComments);
    } catch (err) {
      console.error("Failed to fetch topic comments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [topicId, token]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);
  
  const handlePostComment = async (content: string, parentId: number | null) => {
    if (!topicId || !token) {
        alert("댓글을 작성하려면 로그인이 필요합니다.");
        return;
    }
    try {
        // Assume stance is NEUTRAL for this context
        await postTopicComment(topicId, content, parentId, 'NEUTRAL', token);
        loadComments(); // Re-fetch comments to see the new one
    } catch (error) {
        console.error("Failed to post comment:", error);
        alert(`댓글 작성 실패: ${(error as Error).message}`);
    }
  };

  const handleEditComment = async (commentId: number, content: string) => {
    if (!token) return;
    try {
        await updateTopicComment(commentId, content, token);
        loadComments(); // Re-fetch to see the update
    } catch (error) {
        console.error("Failed to edit comment:", error);
        alert(`댓글 수정 실패: ${(error as Error).message}`);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) return;
    try {
        await deleteTopicComment(commentId, token);
        loadComments(); // Re-fetch to reflect deletion
    } catch (error) {
        console.error("Failed to delete comment:", error);
        alert(`댓글 삭제 실패: ${(error as Error).message}`);
    }
  };


  const isDarkMode = theme === "dark";
  const containerClasses = isDarkMode
    ? "relative flex flex-col h-full rounded-2xl overflow-hidden border border-white/10 bg-card shadow-2xl"
    : "relative flex flex-col h-full rounded-2xl overflow-hidden border border-border bg-card shadow-lg";

  // --- Render ---
  return (
    <div className={containerClasses}>
      {/* Header */}
      <div
        className={`flex justify-between items-center p-3 h-16 shrink-0 ${
          isDarkMode ? "border-b border-white/10 bg-black" : "border-b border-border bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-foreground truncate">
            {topic ? topic.display_name : "토픽을 선택해주세요"}
          </h2>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="ml-3 text-lg">댓글을 불러오는 중...</p>
          </div>
        ) : (
          <>
            {comments.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full text-muted-foreground">
                <MessageSquareText size={48} />
                <p className="mt-4 text-lg font-semibold">아직 댓글이 없습니다.</p>
                <p>첫 댓글을 작성해보세요!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <TopicCommentItem
                    key={comment.id}
                    comment={comment}
                    onPostReply={handlePostComment}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                />
              ))
            )}
          </>
        )}
      </div>

      {/* Footer Input */}
       {topic && user && (
        <div className={`shrink-0 px-4 py-4 ${isDarkMode ? "border-t border-white/10 bg-black" : "border-t border-border bg-white"}`}>
            <CommentInput 
                onSubmit={(content) => handlePostComment(content, null)}
                parentId={null}
            />
        </div>
       )}
    </div>
  );
}
