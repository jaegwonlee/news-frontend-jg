import { fetchWrapper } from './fetchWrapper';
import { Comment, ApiComment } from '@/types';
import { mockComments } from '@/app/mocks/comments';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'; // Set to true to use mock data

// Helper function to map ApiComment to Comment
const mapApiCommentToComment = (apiComment: ApiComment): Comment => {
  const getCleanedReaction = (val: any): 'LIKE' | 'DISLIKE' | null => {
    if (val === 'Unknown Type: null' || val === undefined) return null;
    return val;
  };

  // API 응답에서 camelCase(currentUserReaction)와 snake_case(current_user_reaction)를 모두 확인합니다.
  const reaction = getCleanedReaction(apiComment.currentUserReaction) || getCleanedReaction(apiComment.current_user_reaction);

  const comment: Comment = {
    id: apiComment.id,
    author_id: apiComment.user_id,
    author_name: apiComment.nickname,
    avatar_url: apiComment.avatar_url || apiComment.profile_image_url, // Fallback to old field
    content: apiComment.content,
    created_at: apiComment.created_at,
    status: apiComment.status as 'ACTIVE' | 'DELETED_BY_USER' | undefined,
    parent_id: apiComment.parent_comment_id,
    like_count: apiComment.like_count,
    dislike_count: apiComment.dislike_count,
    currentUserReaction: reaction,
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
export const getComments = async (articleId: number, token?: string): Promise<{ comments: Comment[], totalCount: number }> => {
  if (USE_MOCKS) {
    console.log(`Mock: Fetching comments for article ${articleId}`);
    const mappedComments = mockComments.map(mapApiCommentToComment);
    return Promise.resolve({ comments: mappedComments, totalCount: mockComments.length });
  }

  const url = `/api/articles/${articleId}/comments`;
  
  const response = await fetchWrapper(url, {
    method: 'GET',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to fetch comments for article ${articleId}` }));
    throw new Error(errorData.message || `Failed to fetch comments for article ${articleId}`);
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
  if (USE_MOCKS) {
    console.log(`Mock: Adding comment to article ${articleId}`);
    const newComment: ApiComment = {
        id: Math.floor(Math.random() * 10000),
        content,
        parent_comment_id: parentId || null,
        created_at: new Date().toISOString(),
        user_id: 1, // Mock user ID
        nickname: "목업맨", // Mock user nickname
        profile_image_url: "/user-placeholder.svg",
        like_count: 0,
        dislike_count: 0,
        current_user_reaction: null,
        replies: []
    };
    return Promise.resolve(mapApiCommentToComment(newComment));
  }

  const response = await fetchWrapper(`/api/articles/${articleId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content, parent_comment_id: parentId }), // Use parent_comment_id
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to add comment to article ${articleId}` }));
    throw new Error(errorData.message || `Failed to add comment to article ${articleId}`);
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
  if (USE_MOCKS) {
    console.log(`Mock: Deleting comment ${commentId}`);
    return Promise.resolve({ message: "성공적으로 삭제되었습니다. (목업)" });
  }

  const response = await fetchWrapper(`/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to delete comment ${commentId}` }));
    throw new Error(errorData.message || `Failed to delete comment ${commentId}`);
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
    if (USE_MOCKS) {
        console.log(`Mock: Updating comment ${commentId}`);
        const originalComment = mockComments.find(c => c.id === commentId) || mockComments[0].replies?.find(r => r.id === commentId);
        const updatedComment: ApiComment = {
            ...(originalComment || mockComments[0]),
            id: commentId,
            content,
        };
        return Promise.resolve(mapApiCommentToComment(updatedComment));
    }

  const response = await fetchWrapper(`/api/comments/${commentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to update comment ${commentId}` }));
    throw new Error(errorData.message || `Failed to update comment ${commentId}`);
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
    if (USE_MOCKS) {
        console.log(`Mock: Reporting comment ${commentId} for reason: ${reason}`);
        return Promise.resolve({ message: "신고가 접수되었습니다. (목업)" });
    }

  const response = await fetchWrapper(`/api/comments/${commentId}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to report comment ${commentId}` }));
    throw new Error(errorData.message || `Failed to report comment ${commentId}`);
  }
  return response.json();
};

/**
 * @function reactToComment
 * @description 사용자가 특정 댓글에 '좋아요' 또는 '싫어요' 반응을 추가/변경/삭제합니다.
 * 백엔드 API: POST /api/comments/{commentId}/react
 * @param {number} commentId - 반응을 적용할 댓글의 ID.
 * @param {'LIKE' | 'DISLIKE' | 'NONE'} reactionType - 적용할 반응의 유형. 'NONE'은 취소를 의미합니다.
 * @param {string} token - 사용자 인증 토큰.
 * @returns {Promise<{ like_count: number; dislike_count: number; currentUserReaction: 'LIKE' | 'DISLIKE' | null }>} - 업데이트된 댓글의 통계 및 사용자 반응 상태.
 * @throws {Error} - API 호출 실패 시 에러를 발생시킵니다.
 */
export const reactToComment = async (
  commentId: number,
  reactionType: 'LIKE' | 'DISLIKE' | 'NONE',
  token: string
): Promise<{ like_count: number; dislike_count: number; currentUserReaction: 'LIKE' | 'DISLIKE' | null }> => {
  if (USE_MOCKS) {
    console.log(`Mock: Reacting to comment ${commentId} with ${reactionType}`);
    return Promise.resolve({
        like_count: Math.floor(Math.random() * 20),
        dislike_count: Math.floor(Math.random() * 5),
        currentUserReaction: reactionType === 'NONE' ? null : reactionType,
    });
  }
  
  let response;
  const url = `/api/comments/${commentId}/react`;

  if (reactionType === 'NONE') {
    // 반응 취소 시 DELETE 요청
    response = await fetchWrapper(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } else {
    // 반응 추가 또는 변경 시 POST 요청
    response = await fetchWrapper(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reaction: reactionType }), // API 명세에 따라 'reaction' 필드 사용
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '댓글 반응 업데이트에 실패했습니다.' }));
    throw new Error(errorData.message || '댓글 반응 업데이트에 실패했습니다.');
  }

  const data = await response.json();

  const getCleanedReaction = (val: any): 'LIKE' | 'DISLIKE' | null => {
    if (val === 'Unknown Type: null' || val === undefined) return null;
    return val;
  };

  const reaction = getCleanedReaction(data.currentUserReaction) || getCleanedReaction(data.current_user_reaction);

  return {
    like_count: data.like_count,
    dislike_count: data.dislike_count,
    currentUserReaction: reaction,
  };
};