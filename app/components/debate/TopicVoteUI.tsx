"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import { castTopicVote } from '@/lib/api/topics';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';

interface TopicVoteUIProps {
    topicId: number;
    initialVoteCounts: { left: number; right: number };
    userStance: 'LEFT' | 'RIGHT' | null;
    onVoteSuccess: (newVoteCounts: { left: number; right: number }, newUserStance: 'LEFT' | 'RIGHT') => void;
}

export default function TopicVoteUI({ topicId, initialVoteCounts, userStance: initialUserStance, onVoteSuccess }: TopicVoteUIProps) {
    const { token } = useAuth();
    const [userStance, setUserStance] = useState<'LEFT' | 'RIGHT' | null>(initialUserStance);
    const [voteCounts, setVoteCounts] = useState(initialVoteCounts);
    const [isVoting, setIsVoting] = useState(false);

    const totalVotes = voteCounts.left + voteCounts.right;
    const leftPercent = totalVotes === 0 ? 50 : (voteCounts.left / totalVotes) * 100;
    const rightPercent = totalVotes === 0 ? 50 : (voteCounts.right / totalVotes) * 100;

    const handleVote = async (stance: 'LEFT' | 'RIGHT') => {
        if (!token) {
            alert('로그인 후 투표할 수 있습니다.');
            return;
        }
        if (isVoting) return; // Prevent double clicking
        if (userStance === stance) return; // Already voted for this stance, disallow re-vote for simplicity

        setIsVoting(true);
        try {
            const response = await castTopicVote(topicId, stance, token);
            setVoteCounts({
                left: response.voteCountLeft || voteCounts.left,
                right: response.voteCountRight || voteCounts.right,
            });
            setUserStance(stance);
            onVoteSuccess({ left: response.voteCountLeft || voteCounts.left, right: response.voteCountRight || voteCounts.right }, stance);
        } catch (error) {
            console.error('Failed to cast vote:', error);
            alert(`투표에 실패했습니다: ${(error as Error).message}`);
        } finally {
            setIsVoting(false);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 border border-border rounded-xl bg-card shadow-sm mb-8">
            <h3 className="text-xl font-bold text-foreground mb-4">당신의 의견은?</h3>
            <div className="flex justify-around w-full max-w-sm gap-4 mb-6">
                <button
                    onClick={() => handleVote('LEFT')}
                    disabled={isVoting || userStance === 'LEFT'}
                    className={cn(
                        "flex flex-col items-center p-4 rounded-lg flex-1 transition-all duration-200",
                        "text-blue-500 border-2 border-blue-500 hover:bg-blue-500 hover:text-white",
                        userStance === 'LEFT' && "bg-blue-500 text-white shadow-lg",
                        isVoting && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isVoting ? <Loader2 className="w-6 h-6 animate-spin" /> : <ThumbsUp className="w-8 h-8 mb-2" />}
                    <span className="font-semibold text-lg">찬성</span>
                </button>
                <button
                    onClick={() => handleVote('RIGHT')}
                    disabled={isVoting || userStance === 'RIGHT'}
                    className={cn(
                        "flex flex-col items-center p-4 rounded-lg flex-1 transition-all duration-200",
                        "text-red-500 border-2 border-red-500 hover:bg-red-500 hover:text-white",
                        userStance === 'RIGHT' && "bg-red-500 text-white shadow-lg",
                        isVoting && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isVoting ? <Loader2 className="w-6 h-6 animate-spin" /> : <ThumbsDown className="w-8 h-8 mb-2" />}
                    <span className="font-semibold text-lg">반대</span>
                </button>
            </div>
            
            <div className="w-full h-8 flex rounded-full overflow-hidden text-sm font-bold shadow-inner">
                <div className="bg-blue-600 flex items-center justify-center text-white" style={{ width: `${leftPercent}%` }}>
                    {totalVotes > 0 && `${Math.round(leftPercent)}%`}
                </div>
                <div className="bg-red-600 flex items-center justify-center text-white" style={{ width: `${rightPercent}%` }}>
                    {totalVotes > 0 && `${Math.round(rightPercent)}%`}
                </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">총 {totalVotes.toLocaleString()}명 참여</p>
        </div>
    );
}
