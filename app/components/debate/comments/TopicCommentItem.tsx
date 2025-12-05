"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Comment } from '@/lib/types/comment';
import { useAuth } from '@/app/context/AuthContext';
import { formatRelativeTime, getFullImageUrl } from '@/lib/utils';
import { Reply, Edit, Trash, ThumbsUp, ThumbsDown } from 'lucide-react';
import CommentInput from './CommentInput';
import { Button } from '@/app/components/common/Button';

interface TopicCommentItemProps {
    comment: Comment;
    onPostReply: (content: string, parentId: number | null) => Promise<void>;
    onEdit: (commentId: number, content: string) => Promise<void>;
    onDelete: (commentId: number) => Promise<void>;
}

const StanceBadge = ({ stance }: { stance: 'LEFT' | 'RIGHT' | 'NEUTRAL' | undefined }) => {
    if (!stance || stance === 'NEUTRAL') return null;

    const isPro = stance === 'LEFT';
    const content = isPro ? '찬성측' : '반대측';
    const Icon = isPro ? ThumbsUp : ThumbsDown;
    const colors = isPro 
        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
        : 'bg-red-500/10 text-red-400 border-red-500/20';

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${colors}`}>
            <Icon size={12} />
            {content}
        </span>
    );
};


export default function TopicCommentItem({ comment, onPostReply, onEdit, onDelete }: TopicCommentItemProps) {
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
        <div className="flex items-start gap-3 p-4 bg-background border border-border rounded-xl">
            <Image 
                src={getFullImageUrl(comment.profile_image_url)}
                alt={comment.author_name}
                width={40}
                height={40}
                className="rounded-full h-10 w-10 flex-shrink-0"
            />
            <div className="flex-1">
                {!isEditing ? (
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-foreground">{comment.author_name}</span>
                            <StanceBadge stance={comment.stance} />
                            <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
                        </div>

                        {comment.status === 'DELETED_BY_USER' || comment.status === 'DELETED_BY_ADMIN' ? (
                            <p className="text-sm mt-2 text-muted-foreground italic">[삭제된 메시지입니다]</p>
                        ) : comment.status === 'HIDDEN' ? (
                            <p className="text-sm mt-2 text-muted-foreground italic">[숨겨진 메시지입니다]</p>
                        ) : (
                            <p className="text-base mt-2 text-foreground whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                        )}
                    </div>
                ) : (
                    <CommentInput 
                        onSubmit={(content) => handleEditSubmit(content)}
                        initialContent={comment.content}
                        onCancel={() => setIsEditing(false)}
                        parentId={comment.id}
                    />
                )}

                {!isEditing && comment.status === 'ACTIVE' && (
                    <div className="flex items-center gap-1 mt-2">
                        <Button onClick={() => setIsReplying(!isReplying)} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            <Reply size={14} className="mr-1" />
                            답글
                        </Button>
                        {isAuthor && (
                            <>
                                <Button onClick={() => setIsEditing(true)} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                    <Edit size={14} />
                                </Button>
                                <Button onClick={() => onDelete(comment.id)} variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                    <Trash size={14} />
                                </Button>
                            </>
                        )}
                    </div>
                )}
                
                {isReplying && (
                    <div className="mt-3">
                        <CommentInput 
                            onSubmit={handleReplySubmit}
                            onCancel={() => setIsReplying(false)}
                            parentId={comment.id}
                            placeholder={`${comment.author_name}님에게 답글 남기기...`}
                        />
                    </div>
                )}
                
                {comment.children && comment.children.length > 0 && (
                     <div className="mt-4 pt-4 space-y-4 border-t border-border">
                        {comment.children.map(child => (
                            <TopicCommentItem 
                                key={child.id}
                                comment={child}
                                onPostReply={onPostReply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
