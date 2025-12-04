"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Comment } from '@/lib/types/comment';
import { useAuth } from '@/app/context/AuthContext';
import { formatRelativeTime, getFullImageUrl } from '@/lib/utils';
import { Reply, Edit, Trash } from 'lucide-react';
import CommentInput from './CommentInput';
import { Button } from '@/app/components/common/Button';

interface TopicCommentItemProps {
    comment: Comment;
    onPostReply: (content: string, parentId: number | null) => Promise<void>;
    onEdit: (commentId: number, content: string) => Promise<void>;
    onDelete: (commentId: number) => Promise<void>;
}

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
        <div className="flex gap-4 pt-4">
            <Image 
                src={getFullImageUrl(comment.profile_image_url)}
                alt={comment.author_name}
                width={40}
                height={40}
                className="rounded-full h-10 w-10 mt-1 bg-muted border-2 border-primary-foreground/20"
            />
            <div className="flex-1">
                {!isEditing ? (
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-foreground">{comment.author_name}</span>
                            <span className="text-xs text-muted-foreground ml-1">{formatRelativeTime(comment.created_at)}</span>
                            {comment.status === 'DELETED_BY_USER' && <span className="text-xs text-red-500 ml-2">(삭제됨)</span>}
                            {comment.status === 'HIDDEN' && <span className="text-xs text-yellow-500 ml-2">(숨김)</span>}
                        </div>
                        <p className="text-sm mt-1 text-foreground whitespace-pre-wrap leading-relaxed">{comment.content}</p>
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
                    <div className="flex items-center gap-2 mt-2 text-xs">
                        <Button onClick={() => setIsReplying(!isReplying)} variant="ghost" size="sm" className="flex items-center gap-1 px-2 py-1 h-auto text-muted-foreground hover:bg-accent hover:text-foreground">
                            <Reply size={14} />
                            <span>답글</span>
                        </Button>
                        {isAuthor && (
                            <>
                                <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm" className="p-1.5 h-auto text-muted-foreground hover:bg-accent hover:text-foreground">
                                    <Edit size={14} />
                                </Button>
                                <Button onClick={() => onDelete(comment.id)} variant="ghost" size="sm" className="p-1.5 h-auto text-muted-foreground hover:bg-accent hover:text-destructive">
                                    <Trash size={14} />
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
                    <div className="mt-4 pt-4 space-y-4 border-l-2 border-blue-500/30 pl-4 bg-gray-800/10 rounded-lg">
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
