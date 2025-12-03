import { Comment } from "@/lib/types/comment";
import { fetchWrapper } from "./fetchWrapper";

/**
 * Fetches comments for a specific topic.
 * The API returns a nested structure, which we expect to be handled by the component.
 */
export async function getTopicComments(topicId: string, token?: string): Promise<{ comments: Comment[] }> {
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetchWrapper(`/api/comments/topics/${topicId}`, { 
        headers,
        cache: 'no-store' 
    });
    if (!response.ok) {
        console.error("Failed to fetch topic comments, status:", response.status);
        throw new Error("토론의 댓글을 불러오는 데 실패했습니다.");
    }

    const rawData = await response.json();
    const rawComments = Array.isArray(rawData) ? rawData : (rawData.comments || []);

    const mappedComments: Comment[] = rawComments.map((c: ApiComment) => ({
        id: c.id,
        parent_id: c.parent_comment_id,
        content: c.content,
        created_at: c.created_at,
        author_id: c.user_id,
        author_name: c.nickname,
        profile_image_url: c.profile_image_url,
        stance: c.user_vote_side, // Assuming user_vote_side is the stance
        children: c.replies || [],
        status: c.status
    }));
    
    return { comments: mappedComments };
}

/**
 * Posts a new comment to a specific topic.
 * The 'stance' is important to categorize the comment under 'pro', 'con', or 'neutral'.
 */
export async function postTopicComment(
    topicId: string, 
    content: string, 
    parentId: number | null,
    stance: 'LEFT' | 'RIGHT' | 'NEUTRAL',
    token: string
): Promise<Comment> {
    const response = await fetchWrapper(`/api/comments/topics/${topicId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parent_comment_id: parentId, stance }),
    });
    if (!response.ok) {
        const err: { message: string } = await response.json().catch(() => ({ message: "댓글 작성에 실패했습니다." }));
        throw new Error(err.message);
    }
    return response.json();
}

/**
 * Updates (patches) an existing comment.
 */
export async function updateTopicComment(commentId: number, content: string, token: string): Promise<Comment> {
    const response = await fetchWrapper(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });
    if (!response.ok) {
        const err: { message: string } = await response.json().catch(() => ({ message: "댓글 수정에 실패했습니다." }));
        throw new Error(err.message);
    }
    return response.json();
}

/**
 * Deletes a comment.
 */
export async function deleteTopicComment(commentId: number, token: string): Promise<void> {
    const response = await fetchWrapper(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok && response.status !== 204) {
        const err: { message: string } = await response.json().catch(() => ({ message: "댓글 삭제에 실패했습니다." }));
        throw new Error(err.message);
    }
}

/**
 * Reports a comment.
 */
export async function reportTopicComment(commentId: number, reason: string, token: string): Promise<{ message: string }> {
    const response = await fetchWrapper(`/api/comments/${commentId}/reports`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
    });
    if (!response.ok) {
        const err: { message: string } = await response.json().catch(() => ({ message: "댓글 신고에 실패했습니다." }));
        throw new Error(err.message);
    }
    return response.json();
}

/**
 * Posts a reaction to a specific comment.
 * @param commentId - The ID of the comment to react to.
 * @param reactionType - The type of reaction (e.g., 'like', 'dislike').
 * @param token - User authentication token.
 * @returns A promise that resolves to an object indicating success or a message.
 */
export async function postCommentReaction(commentId: number, reactionType: string, token: string): Promise<{ message: string }> {
    const response = await fetchWrapper(`/api/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_type: reactionType }), // Assuming the backend expects 'reaction_type'
    });
    if (!response.ok) {
        const err: { message: string } = await response.json().catch(() => ({ message: "댓글 반응 추가에 실패했습니다." }));
        throw new Error(err.message);
    }
    return response.json();
}
