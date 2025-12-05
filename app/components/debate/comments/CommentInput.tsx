"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/common/Button';
import { Loader2 } from 'lucide-react';

interface CommentInputProps {
    onSubmit: (content: string, parentId: number | null) => Promise<void>;
    initialContent?: string;
    onCancel?: () => void;
    parentId?: number | null;
    placeholder?: string;
}

export default function CommentInput({ 
    onSubmit, 
    initialContent = "", 
    onCancel, 
    parentId = null,
    placeholder = "당신의 의견을 남겨주세요..."
}: CommentInputProps) {
    const { user } = useAuth();
    const [content, setContent] = useState(initialContent);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content, parentId);
            setContent(""); // Clear input after successful submission
            if (onCancel) onCancel(); // Close edit/reply form
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="border border-border rounded-lg p-4 text-center text-muted-foreground">
                댓글을 작성하려면 <a href="/login" className="text-primary hover:underline">로그인</a>해주세요.
            </div>
        );
    }
    
    return (
        <form onSubmit={handleSubmit} className="flex items-start gap-3 p-4 bg-background border border-border rounded-xl">
            <div className="flex-shrink-0">
                <Image 
                    src={user.profile_image_url || '/user-placeholder.svg'} 
                    alt={user.nickname || 'user avatar'}
                    width={40}
                    height={40}
                    className="rounded-full"
                />
            </div>
            <div className="flex-grow">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 resize-y"
                    rows={initialContent ? 4 : 3}
                    disabled={isSubmitting}
                />
                <div className="flex justify-end gap-2 mt-2">
                    {onCancel && (
                        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
                            취소
                        </Button>
                    )}
                    <Button type="submit" size="sm" disabled={!content.trim() || isSubmitting}>
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "등록 중..." : (initialContent ? "수정" : "등록")}
                    </Button>
                </div>
            </div>
        </form>
    );
}
