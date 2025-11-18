import { fetchWrapper } from './fetchWrapper';
import { Comment, ApiComment } from '@/types';

// Helper function to map ApiComment to Comment
const mapApiCommentToComment = (apiComment: ApiComment): Comment => {
  const comment: Comment = {
    id: apiComment.id,
    author_id: apiComment.user_id,
    author_name: apiComment.nickname,
    avatar_url: apiComment.avatar_url || apiComment.profile_image_url, // Fallback to old field
    content: apiComment.content,
    created_at: apiComment.created_at,
    status: apiComment.status as 'ACTIVE' | 'DELETED_BY_USER' | undefined,
    parent_id: apiComment.parent_comment_id,
  };

  if (apiComment.replies && apiComment.replies.length > 0) {
    comment.children = apiComment.replies.map(reply => mapApiCommentToComment(reply));
  }
  return comment;
};

/**
 * 특정 기사의 댓글 목록을 가져옵니다.
 * @param articleId - 댓글을 가져올 기사의 ID
 * @param token - 사용자 인증 토큰 (선택 사항)
 * @returns 댓글 목록 Promise
 */
export const getComments = async (articleId: number, token?: string, sort?: string): Promise<{ comments: Comment[], totalCount: number }> => {
  let url = `/api/articles/${articleId}/comments`;
  if (sort) {
    url += `?sort=${sort}`;
  }
  
  const response = await fetchWrapper(url, {
    method: 'GET',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch comments for article ${articleId}`);
  }
  const apiResponse = await response.json();
  
  const mappedComments = (apiResponse.comments || []).map(mapApiCommentToComment);

  return {
    comments: mappedComments,
    totalCount: apiResponse.totalCount || 0,
  };
};

/**
 * 특정 기사에 새 댓글을 작성합니다.
 * @param articleId - 댓글을 작성할 기사의 ID
 * @param content - 댓글 내용
 * @param token - 사용자 인증 토큰
 * @param parentId - 부모 댓글 ID (대댓글인 경우)
 * @returns 생성된 댓글 Promise
 */
export const addComment = async (articleId: number, content: string, token: string, parentId?: number): Promise<Comment> => {
  const response = await fetchWrapper(`/api/articles/${articleId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content, parent_comment_id: parentId }), // Use parent_comment_id
  });
  if (!response.ok) {
    throw new Error(`Failed to add comment to article ${articleId}`);
  }
  const apiResponse: { message: string; comment: ApiComment } = await response.json();
  return mapApiCommentToComment(apiResponse.comment);
};

/**
 * 댓글을 삭제합니다.
 * @param commentId - 삭제할 댓글의 ID
 * @param token - 사용자 인증 토큰
 * @returns 성공 여부 Promise
 */
export const deleteComment = async (commentId: number, token: string): Promise<{ message: string }> => {
  const response = await fetchWrapper(`/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to delete comment ${commentId}`);
  }
  return response.json(); // This API returns { message: string }, no mapping needed
};

/**
 * 댓글을 수정합니다.
 * @param commentId - 수정할 댓글의 ID
 * @param content - 수정할 내용
 * @param token - 사용자 인증 토큰
 * @returns 수정된 댓글 Promise
 */
export const updateComment = async (commentId: number, content: string, token: string): Promise<Comment> => {
  const response = await fetchWrapper(`/api/comments/${commentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update comment ${commentId}`);
  }
  const apiComment: ApiComment = await response.json();
  return mapApiCommentToComment(apiComment);
};

/**
 * 특정 댓글을 신고합니다.
 * @param commentId - 신고할 댓글의 ID
 * @param reason - 신고 사유
 * @param token - 사용자 인증 토큰
 * @returns 응답 메시지 Promise
 */
export const reportComment = async (commentId: number, reason: string, token: string): Promise<{ message: string }> => {
  const response = await fetchWrapper(`/api/comments/${commentId}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
  // The API returns 200 OK for both success and 409 Conflict (already reported)
  // So we just check if response is ok, and parse the message.
  if (!response.ok) {
    // If the backend sends a non-200 status for other errors, we can catch it here.
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to report comment ${commentId}`);
  }
  return response.json();
};

/**
 * 특정 댓글에 반응(좋아요/싫어요)을 추가/변경/삭제합니다.
 * @param commentId - 반응할 댓글의 ID
 * @param reactionType - 'LIKE' 또는 'DISLIKE'
 * @param token - 사용자 인증 토큰
 * @returns 업데이트된 좋아요/싫어요 수 및 현재 사용자 반응 Promise
 */
export const reactToComment = async (
  commentId: number,
  reactionType: 'LIKE' | 'DISLIKE',
  token: string
): Promise<{ like_count: number; dislike_count: number; currentUserReaction: 'LIKE' | 'DISLIKE' | null }> => {
  const response = await fetchWrapper(`/api/comments/${commentId}/react`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ reaction: reactionType }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to react to comment ${commentId}`);
  }

  return response.json();
};
