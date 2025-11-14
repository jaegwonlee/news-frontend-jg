import { fetchWrapper } from './fetchWrapper';
import { Comment } from '@/types';

/**
 * 특정 기사의 댓글 목록을 가져옵니다.
 * @param articleId - 댓글을 가져올 기사의 ID
 * @param token - 사용자 인증 토큰 (선택 사항)
 * @returns 댓글 목록 Promise
 */
export const getComments = async (articleId: number, token?: string): Promise<Comment[]> => {
  const response = await fetchWrapper(`/api/articles/${articleId}/comments`, {
    method: 'GET',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch comments for article ${articleId}`);
  }
  return response.json();
};

/**
 * 특정 기사에 새 댓글을 작성합니다.
 * @param articleId - 댓글을 작성할 기사의 ID
 * @param content - 댓글 내용
 * @param token - 사용자 인증 토큰
 * @returns 생성된 댓글 Promise
 */
export const addComment = async (articleId: number, content: string, token: string, parentId?: number): Promise<Comment> => {
  const response = await fetchWrapper(`/api/articles/${articleId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content, parent_id: parentId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to add comment to article ${articleId}`);
  }
  return response.json();
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
  return response.json();
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
  return response.json();
};
