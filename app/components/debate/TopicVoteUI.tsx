"use client";

import { useAuth } from "@/app/context/AuthContext";
import { castTopicVote } from "@/lib/api/topics";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface TopicVoteUIProps {
  topicId: number;
  initialVoteCounts: { left: number; right: number };
  userStance: "LEFT" | "RIGHT" | null;
  onVoteSuccess: (newVoteCounts: { left: number; right: number }, newUserStance: "LEFT" | "RIGHT") => void;
  stanceLeft: string;
  stanceRight: string;
}

export default function TopicVoteUI({
  topicId,
  initialVoteCounts,
  userStance: initialUserStance,
  onVoteSuccess,
  stanceLeft,
  stanceRight,
}: TopicVoteUIProps) {
  const { token } = useAuth();
  const [userStance, setUserStance] = useState<"LEFT" | "RIGHT" | null>(initialUserStance);
  const [voteCounts, setVoteCounts] = useState(initialVoteCounts);
  const [isVoting, setIsVoting] = useState(false);

  const totalVotes = voteCounts.left + voteCounts.right;
  const leftPercent = totalVotes === 0 ? 50 : (voteCounts.left / totalVotes) * 100;
  const rightPercent = totalVotes === 0 ? 50 : (voteCounts.right / totalVotes) * 100;

  const handleVote = async (stance: "LEFT" | "RIGHT") => {
    if (!token) {
      alert("로그인 후 투표할 수 있습니다.");
      // TODO: Redirect to login or open modal
      return;
    }

    // If already voted for this side, do nothing
    if (userStance === stance) return;

    // If already voted for opposite side, prevent change
    if (userStance && userStance !== stance) {
      alert("투표는 변경 불가합니다.");
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      const response = await castTopicVote(topicId, stance, token);

      // Update local state with new counts and stance
      setVoteCounts({
        left: response.voteCountLeft || voteCounts.left + (stance === "LEFT" ? 1 : 0),
        right: response.voteCountRight || voteCounts.right + (stance === "RIGHT" ? 1 : 0),
      });
      setUserStance(stance);

      // Notify parent
      onVoteSuccess(
        { left: response.voteCountLeft || voteCounts.left, right: response.voteCountRight || voteCounts.right },
        stance
      );
    } catch (error) {
      console.error("Failed to cast vote:", error);
      alert(`투표에 실패했습니다: ${(error as Error).message}`);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="w-full mb-12">
      {/* Round Header */}
      <div className="flex justify-between items-center mb-4 px-2">
        <span
          className={cn(
            "text-sm font-bold transition-all",
            userStance === "LEFT" ? "text-blue-600 scale-110" : "text-blue-500"
          )}
        >
          {stanceLeft}
        </span>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Round 2</span>
          <span className="text-xs text-muted-foreground">종료까지 14:35:20 남음</span>
        </div>
        <span
          className={cn(
            "text-sm font-bold transition-all",
            userStance === "RIGHT" ? "text-red-600 scale-110" : "text-red-500"
          )}
        >
          {stanceRight}
        </span>
      </div>

      {/* Main Split Container */}
      <div className="relative flex w-full h-[320px] md:h-[400px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
        {/* Left Side (Blue) */}
        <div
          className={cn(
            "relative flex-1 flex flex-col items-center justify-center p-6 group transition-all duration-500",
            userStance === "LEFT" ? "bg-blue-100 flex-[1.2]" : "bg-blue-50",
            userStance === "RIGHT" && "opacity-50 grayscale-[0.5]"
          )}
        >
          <div className="absolute inset-0 bg-blue-200/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Image
            src="/blue--glove.svg"
            width={120}
            height={120}
            alt="Blue Glove"
            className={cn(
              "drop-shadow-xl mb-6 transition-transform duration-300",
              userStance === "LEFT" ? "scale-125" : "group-hover:scale-110"
            )}
          />
          <button
            onClick={() => handleVote("LEFT")}
            disabled={isVoting || userStance === "LEFT"} // Disable if already selected
            className={cn(
              "relative z-10 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all transform",
              userStance === "LEFT"
                ? "bg-blue-600 text-white ring-4 ring-blue-200 scale-105 cursor-default"
                : "bg-white text-blue-600 hover:bg-blue-600 hover:text-white hover:-translate-y-1"
            )}
          >
            {isVoting && userStance !== "RIGHT" ? (
              <Loader2 className="animate-spin w-6 h-6" />
            ) : userStance === "LEFT" ? (
              "투표 완료"
            ) : (
              stanceLeft
            )}
          </button>
        </div>

        {/* Center Divider & Stats */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
          <div className="bg-white rounded-full px-6 py-2 shadow-xl border border-gray-100 flex items-center gap-4 mb-4">
            <span className="text-blue-600 font-black text-xl">{Math.round(leftPercent)}%</span>
            <div className="h-4 w-px bg-gray-300" />
            <span className="text-red-600 font-black text-xl">{Math.round(rightPercent)}%</span>
          </div>
          <div className="bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md animate-pulse">
            🔥 {totalVotes.toLocaleString()}명 투표 중!
          </div>
        </div>

        {/* Right Side (Red) */}
        <div
          className={cn(
            "relative flex-1 flex flex-col items-center justify-center p-6 group transition-all duration-500",
            userStance === "RIGHT" ? "bg-red-100 flex-[1.2]" : "bg-red-50",
            userStance === "LEFT" && "opacity-50 grayscale-[0.5]"
          )}
        >
          <div className="absolute inset-0 bg-red-200/50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Image
            src="/red--glove.svg"
            width={120}
            height={120}
            alt="Red Glove"
            className={cn(
              "drop-shadow-xl mb-6 transition-transform duration-300 scale-x-[-1]",
              userStance === "RIGHT" ? "scale-x-[-1] scale-125" : "group-hover:scale-x-[-1] group-hover:scale-110"
            )}
          />
          <button
            onClick={() => handleVote("RIGHT")}
            disabled={isVoting || userStance === "RIGHT"}
            className={cn(
              "relative z-10 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all transform",
              userStance === "RIGHT"
                ? "bg-red-600 text-white ring-4 ring-red-200 scale-105 cursor-default"
                : "bg-white text-red-600 hover:bg-red-600 hover:text-white hover:-translate-y-1"
            )}
          >
            {isVoting && userStance !== "LEFT" ? (
              <Loader2 className="animate-spin w-6 h-6" />
            ) : userStance === "RIGHT" ? (
              "투표 완료"
            ) : (
              stanceRight
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
