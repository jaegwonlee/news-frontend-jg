"use client";

import { useAuth } from "@/app/context/AuthContext";
import { castTopicVote } from "@/lib/api/topics";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface TopicVoteUIProps {
  topicId: number;
  initialVoteCounts: { left: number; right: number };
  userStance: "LEFT" | "RIGHT" | null;
  onVoteSuccess: (newVoteCounts: { left: number; right: number }, newUserStance: "LEFT" | "RIGHT") => void;
  stanceLeft: string;
  stanceRight: string;
  voteEndAt?: string;
}

export default function TopicVoteUI({
  topicId,
  initialVoteCounts,
  userStance: initialUserStance,
  onVoteSuccess,
  stanceLeft,
  stanceRight,
  voteEndAt,
}: TopicVoteUIProps) {
  const { token } = useAuth();
  const [userStance, setUserStance] = useState<"LEFT" | "RIGHT" | null>(initialUserStance);
  const [voteCounts, setVoteCounts] = useState(initialVoteCounts);
  const [isVoting, setIsVoting] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const totalVotes = voteCounts.left + voteCounts.right;
  const leftPercent = totalVotes === 0 ? 50 : (voteCounts.left / totalVotes) * 100;
  const rightPercent = totalVotes === 0 ? 50 : (voteCounts.right / totalVotes) * 100;

  useEffect(() => {
    if (!voteEndAt) return;

    const calculateTime = () => {
      const end = new Date(voteEndAt);
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("투표 종료");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days >= 1) {
        setTimeLeft(`D-${days} (${hours}시간 남음)`);
      } else {
        setTimeLeft(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")} 남음`
        );
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [voteEndAt]);

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
    <div className="w-full mb-16 select-none animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Info */}
      <div className="flex justify-between items-end mb-4 px-1">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
            Corner Blue
          </span>
          <span
            className={cn(
              "text-2xl font-black italic uppercase leading-none transition-all",
              userStance === "LEFT" ? "text-blue-600 scale-105" : "text-slate-400 dark:text-slate-600"
            )}
          >
            {stanceLeft}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">
            Corner Red
          </span>
          <span
            className={cn(
              "text-2xl font-black italic uppercase leading-none transition-all",
              userStance === "RIGHT" ? "text-red-600 scale-105" : "text-slate-400 dark:text-slate-600"
            )}
          >
            {stanceRight}
          </span>
        </div>
      </div>

      {/* Main Fight Container */}
      <div className="relative flex w-full h-[360px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl ring-4 ring-slate-100 dark:ring-slate-800">
        {/* VS Divider (Slanted) */}
        <div className="absolute inset-0 z-10 pointer-events-none flex justify-center">
          <div className="h-full w-px bg-white/20 blur-[1px]" />
          <div className="absolute top-1/2 -translate-y-1/2 w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-100 dark:border-slate-800 shadow-xl z-20">
            <span className="font-black italic text-2xl text-slate-800 dark:text-slate-200">VS</span>
          </div>
        </div>

        {/* LEFT SIDE (BLUE) */}
        <div
          onClick={() => !userStance && handleVote("LEFT")}
          className={cn(
            "relative flex-1 flex flex-col items-center justify-center p-8 transition-all duration-500 cursor-pointer overflow-hidden",
            "bg-gradient-to-br from-blue-500 to-blue-700",
            userStance === "LEFT" ? "flex-[1.5] brightness-105" : "flex-1",
            userStance === "RIGHT" && "flex-[0.5] brightness-50 grayscale"
          )}
        >
          {/* Background FX */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute top-0 left-0 w-full h-full bg-blue-400/10 backdrop-blur-[1px]" />

          <div className="relative z-10 flex flex-col items-center transition-transform duration-300 transform group-hover:scale-105">
            <Image
              src="/blue--glove.svg"
              width={160}
              height={160}
              alt="Blue Glove"
              className={cn(
                "drop-shadow-2xl transition-transform duration-500",
                userStance === "LEFT" && "scale-110 rotate-12"
              )}
            />

            <div className="mt-8 text-center">
              <div className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-2">
                {Math.round(leftPercent)}%
              </div>
              <button
                disabled={isVoting || !!userStance}
                className={cn(
                  "px-8 py-3 rounded-full font-bold text-sm tracking-wider uppercase transition-all shadow-lg",
                  userStance === "LEFT"
                    ? "bg-white text-blue-700 ring-4 ring-blue-300"
                    : "bg-white/20 text-white hover:bg-white hover:text-blue-700 backdrop-blur-md border border-white/30"
                )}
              >
                {isVoting && userStance === "LEFT" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : userStance === "LEFT" ? (
                  "VOTED"
                ) : (
                  "VOTE BLUE"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (RED) */}
        <div
          onClick={() => !userStance && handleVote("RIGHT")}
          className={cn(
            "relative flex-1 flex flex-col items-center justify-center p-8 transition-all duration-500 cursor-pointer overflow-hidden",
            "bg-gradient-to-bl from-red-500 to-red-700",
            userStance === "RIGHT" ? "flex-[1.5] brightness-105" : "flex-1",
            userStance === "LEFT" && "flex-[0.5] brightness-50 grayscale"
          )}
        >
          {/* Background FX */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute top-0 left-0 w-full h-full bg-red-400/10 backdrop-blur-[1px]" />

          <div className="relative z-10 flex flex-col items-center transition-transform duration-300 transform group-hover:scale-105">
            <Image
              src="/red--glove.svg"
              width={160}
              height={160}
              alt="Red Glove"
              className={cn(
                "drop-shadow-2xl transition-transform duration-500 scale-x-[-1]",
                userStance === "RIGHT" && "scale-x-[-1] scale-110 -rotate-12"
              )}
            />

            <div className="mt-8 text-center">
              <div className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-2">
                {Math.round(rightPercent)}%
              </div>
              <button
                disabled={isVoting || !!userStance}
                className={cn(
                  "px-8 py-3 rounded-full font-bold text-sm tracking-wider uppercase transition-all shadow-lg",
                  userStance === "RIGHT"
                    ? "bg-white text-red-700 ring-4 ring-red-300"
                    : "bg-white/20 text-white hover:bg-white hover:text-red-700 backdrop-blur-md border border-white/30"
                )}
              >
                {isVoting && userStance === "RIGHT" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : userStance === "RIGHT" ? (
                  "VOTED"
                ) : (
                  "VOTE RED"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats / Time */}
      <div className="mt-6 flex justify-center">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-full px-6 py-2 flex items-center gap-2 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {totalVotes.toLocaleString()} Votes · {timeLeft || "Ending Soon"}
          </span>
        </div>
      </div>
    </div>
  );
}
