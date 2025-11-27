"use client";

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/common/Button'; // Assuming a generic Button component exists

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
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                className="w-full p-3 bg-input border border-border rounded-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={initialContent ? 3 : 2}
                disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                        취소
                    </Button>
                )}
                <Button type="submit" disabled={!content.trim() || isSubmitting}>
                    {isSubmitting ? "등록 중..." : (initialContent ? "수정" : "등록")}
                </Button>
            </div>
        </form>
    );
}
