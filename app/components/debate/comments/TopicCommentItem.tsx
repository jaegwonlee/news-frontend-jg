"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Comment } from '@/types';
import { useAuth } from '@/app/context/AuthContext';
import { formatRelativeTime, getFullImageUrl } from '@/lib/utils';
import { ThumbsUp, ThumbsDown, Reply, Edit, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import CommentInput from './CommentInput';
import { Button } from '@/app/components/common/Button';

interface TopicCommentItemProps {
    comment: Comment;
    onPostReply: (content: string, parentId: number | null) => Promise<void>;
    onEdit: (commentId: number, content: string) => Promise<void>;
    onDelete: (commentId: number) => Promise<void>;
    onReact: (commentId: number, reaction: 'LIKE' | 'DISLIKE') => Promise<void>;
}

export default function TopicCommentItem({ comment, onPostReply, onEdit, onDelete, onReact }: TopicCommentItemProps) {
    const { user } = useAuth();
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const isAuthor = user?.id === comment.author_id;

    const handleEditSubmit = async (content: string) => {
        await onEdit(comment.id, content);
        setIsEditing(false);
    };
    
    const handleReplySubmit = async (content: string, parentId: number | null) => {
        await onPostReply(content, parentId);
        setIsReplying(false);
    };

    return (
        <div className="flex gap-3 pt-4">
            <Image 
                src={getFullImageUrl(comment.profile_image_url)}
                alt={comment.author_name}
                width={36}
                height={36}
                className="rounded-full h-9 w-9 mt-1 bg-muted"
            />
            <div className="flex-1">
                {!isEditing ? (
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{comment.author_name}</span>
                            <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
                        </div>
                        <p className="text-sm mt-1 text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                ) : (
                    <CommentInput 
                        onSubmit={(content) => handleEditSubmit(content)}
                        initialContent={comment.content}
                        onCancel={() => setIsEditing(false)}
                        parentId={comment.id}
                    />
                )}

                {!isEditing && (
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <Button onClick={() => onReact(comment.id, 'LIKE')} variant="ghost" size="sm" className="flex items-center gap-1.5 px-2">
                            <ThumbsUp size={14} className={cn(comment.currentUserReaction === 'LIKE' && 'text-primary fill-primary/20')} />
                            <span>{comment.like_count || 0}</span>
                        </Button>
                        <Button onClick={() => onReact(comment.id, 'DISLIKE')} variant="ghost" size="sm" className="flex items-center gap-1.5 px-2">
                            <ThumbsDown size={14} className={cn(comment.currentUserReaction === 'DISLIKE' && 'text-destructive fill-destructive/20')} />
                            <span>{comment.dislike_count || 0}</span>
                        </Button>
                        <Button onClick={() => setIsReplying(!isReplying)} variant="ghost" size="sm" className="flex items-center gap-1.5 px-2">
                            <Reply size={14} />
                            <span>답글</span>
                        </Button>
                        {isAuthor && (
                            <>
                                <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm" className="flex items-center gap-1.5 px-2">
                                    <Edit size={14} />
                                    <span>수정</span>
                                </Button>
                                <Button onClick={() => onDelete(comment.id)} variant="ghost" size="sm" className="flex items-center gap-1.5 px-2">
                                    <Trash size={14} />
                                    <span>삭제</span>
                                </Button>
                            </>
                        )}
                    </div>
                )}
                
                {isReplying && (
                    <div className="mt-4">
                        <CommentInput 
                            onSubmit={handleReplySubmit}
                            onCancel={() => setIsReplying(false)}
                            parentId={comment.id}
                            placeholder={`${comment.author_name}님에게 답글 남기기...`}
                        />
                    </div>
                )}
                
                {comment.children && comment.children.length > 0 && (
                    <div className="mt-2 space-y-2 border-l-2 border-border/50 pl-4">
                        {comment.children.map(child => (
                            <TopicCommentItem 
                                key={child.id}
                                comment={child}
                                onPostReply={onPostReply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onReact={onReact}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
